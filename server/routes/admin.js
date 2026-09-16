import express from 'express';
import { 
  readDB, 
  getAllUsers, 
  findUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetDB, 
  logAudit 
} from '../db.js';
import { authenticateToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// Middleware: all admin routes require authentication
router.use(authenticateToken);

// GET /api/admin/users - Get platform users (Super Admin gets all, Travel Admin gets own agency)
router.get('/users', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    let users = getAllUsers();
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      users = users.filter(u => u.agency === req.user.agency);
    }
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const user = findUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role !== ROLES.SUPER_ADMIN && user.agency !== req.user.agency) {
      return res.status(403).json({ success: false, message: 'Access denied to user outside your agency.' });
    }

    const { password, ...userSafe } = user;
    return res.json({ success: true, user: userSafe });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user details.' });
  }
});

// POST /api/admin/users - Create new user from Admin Panel
router.post('/users', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { name, email, phone, password, role, agency, region, address, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Privilege escalation checks
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      if (role === ROLES.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Only Super Administrators can create Super Admin accounts.' });
      }
      if (role === ROLES.TRAVEL_ADMIN) {
        return res.status(403).json({ success: false, message: 'Travel Admins cannot create other Travel Admin accounts.' });
      }
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const targetAgency = (req.user.role === ROLES.SUPER_ADMIN && agency) ? agency : req.user.agency;
    const targetRole = role || ROLES.OPS_STAFF;

    const newUser = createUser({
      name,
      email,
      phone,
      password: password || 'TravelOps2026!',
      role: targetRole,
      agency: targetAgency,
      region: region || 'Indonesia',
      address: address || '',
      status: status || 'Active'
    });

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'ADMIN_CREATE_USER',
      details: `Created new user ${newUser.name} (${newUser.email}) with role ${newUser.role}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      success: true,
      message: `User ${newUser.name} created successfully!`,
      user: newUser
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PUT /api/admin/users/:id - Update user details, role, status, or password
router.put('/users/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, agency, region, address, status, password } = req.body;

    const targetUser = findUserById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Protection for Super Admin accounts
    if (targetUser.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Administrators can modify Super Admin accounts.' });
    }

    // Agency isolation for Travel Admin
    if (req.user.role !== ROLES.SUPER_ADMIN && targetUser.agency !== req.user.agency) {
      return res.status(403).json({ success: false, message: 'Access denied. User belongs to another agency.' });
    }

    // Privilege escalation prevention: setting role to Super Admin or modifying role by non-Super Admin
    if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Administrators can assign Super Admin role.' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (role && req.user.role === ROLES.SUPER_ADMIN) updates.role = role;
    if (role && req.user.role !== ROLES.SUPER_ADMIN && [ROLES.OPS_STAFF, ROLES.FIELD_AGENT].includes(role)) {
      updates.role = role;
    }
    if (agency && req.user.role === ROLES.SUPER_ADMIN) updates.agency = agency;
    if (region) updates.region = region;
    if (address !== undefined) updates.address = address;
    if (status) updates.status = status;
    if (password && password.trim() !== '') updates.password = password;

    const updatedUser = updateUser(id, updates);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'ADMIN_UPDATE_USER',
      details: `Updated user account ${targetUser.email} (Status: ${updatedUser.status}, Role: ${updatedUser.role}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'User updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = findUserById(id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account while logged in.' });
    }

    if (targetUser.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Super Admin accounts cannot be deleted.' });
    }

    if (req.user.role !== ROLES.SUPER_ADMIN && targetUser.agency !== req.user.agency) {
      return res.status(403).json({ success: false, message: 'Access denied. User belongs to another agency.' });
    }

    deleteUser(id);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'ADMIN_DELETE_USER',
      details: `Deleted user account ${targetUser.name} (${targetUser.email}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, message: `User ${targetUser.name} deleted successfully.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// GET /api/admin/stats - Telemetry and platform overview metrics (Super Admin ONLY)
router.get('/stats', requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  try {
    const db = readDB();
    const users = db.users || [];
    const packages = db.packages || [];
    const jamaah = db.jamaah || [];
    const tasks = db.tasks || [];
    const auditLogs = db.auditLogs || [];
    const finance = db.finance || [];

    const activeUsers = users.filter(u => u.status === 'Active').length;
    const suspendedUsers = users.filter(u => u.status === 'Suspended').length;

    // Unique agencies
    const uniqueAgencies = new Set(users.map(u => u.agency).filter(Boolean)).size;

    // Calculate total revenue from completed finance income
    const totalIncome = finance
      .filter(f => f.type === 'INCOME' && f.status === 'COMPLETED')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const totalExpense = finance
      .filter(f => f.type === 'EXPENSE' && f.status === 'COMPLETED')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers,
        suspendedUsers,
        totalAgencies: uniqueAgencies,
        totalPackages: packages.length,
        totalJamaah: jamaah.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        totalFinanceTransactions: finance.length,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        totalAuditLogs: auditLogs.length,
        serverUptime: uptimeFormatted,
        memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        environment: process.env.NODE_ENV || 'production',
        apiVersion: 'v2.5.0'
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
});

// GET /api/admin/audit-logs - Retrieve real-time system audit logs (Super Admin ONLY)
router.get('/audit-logs', requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  try {
    const db = readDB();
    const limit = parseInt(req.query.limit) || 100;
    const logs = (db.auditLogs || []).slice(0, limit);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Admin audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

// POST /api/admin/reset-seeds - Restore demo dataset (Super Admin ONLY)
router.post('/reset-seeds', requireRole(ROLES.SUPER_ADMIN), (req, res) => {
  try {
    resetDB();

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'SYSTEM_SEED_RESET',
      details: 'Restored default demo seed dataset.',
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Database reset to default seed data successfully!'
    });
  } catch (error) {
    console.error('Reset seeds error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset database.' });
  }
});

export default router;

