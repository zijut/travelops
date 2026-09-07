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
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware: all admin routes require authentication and admin/superadmin role
router.use(authenticateToken);
router.use(requireRole('Super Admin', 'Travel Admin'));

// GET /api/admin/users - Get all platform users
router.get('/users', (req, res) => {
  try {
    const users = getAllUsers();
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// POST /api/admin/users - Create new user from Admin Panel
router.post('/users', (req, res) => {
  try {
    const { name, email, phone, password, role, agency, region, address, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const newUser = createUser({
      name,
      email,
      phone,
      password: password || 'TravelOps2026!',
      role: role || 'Ops Staff',
      agency: agency || req.user.agency || 'Travel Partner',
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
router.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, agency, region, address, status, password } = req.body;

    const user = findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Guard: only Super Admin can modify Super Admin accounts
    if (user.role === 'Super Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only Super Administrators can modify Super Admin accounts.' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (role) updates.role = role;
    if (agency) updates.agency = agency;
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
      details: `Updated user account ${user.email} (Status: ${updatedUser.status}, Role: ${updatedUser.role}).`,
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
router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = findUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account while logged in.' });
    }

    if (user.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Super Admin accounts cannot be deleted.' });
    }

    deleteUser(id);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'ADMIN_DELETE_USER',
      details: `Deleted user account ${user.name} (${user.email}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, message: `User ${user.name} deleted successfully.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// GET /api/admin/stats - Telemetry and platform overview metrics
router.get('/stats', (req, res) => {
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

// GET /api/admin/audit-logs - Retrieve real-time system audit logs
router.get('/audit-logs', (req, res) => {
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

// POST /api/admin/reset-seeds - Restore demo dataset
router.post('/reset-seeds', (req, res) => {
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
