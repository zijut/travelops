import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken, requireRole, checkAgencyOwnership, ROLES } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/packages
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let packages = db.packages || [];

    if (req.user.role !== ROLES.SUPER_ADMIN) {
      packages = packages.filter(p => checkAgencyOwnership(req, p.agencyEmail));
    }

    return res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch packages.' });
  }
});


// GET /api/packages/:id
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const pkg = (db.packages || []).find(p => p.id === id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    if (!checkAgencyOwnership(req, pkg.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to this package.' });
    }

    return res.json({ success: true, package: pkg });
  } catch (error) {
    console.error('Error fetching package details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch package details.' });
  }
});

// POST /api/packages - Super Admin & Travel Admin ONLY
router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { name, duration, price, airline, hotel, quota, booked, status } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Package name is required.' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid positive number.' });
    }

    const numQuota = Number(quota) || 50;
    if (numQuota < 0) {
      return res.status(400).json({ success: false, message: 'Quota cannot be negative.' });
    }

    const numBooked = Number(booked) || 0;
    if (numBooked > numQuota) {
      return res.status(400).json({ success: false, message: 'Booked slots cannot exceed total quota.' });
    }

    const validStatuses = ['Draft', 'Published', 'Sold Out'];
    const finalStatus = validStatuses.includes(status) ? status : (numBooked >= numQuota ? 'Sold Out' : 'Draft');

    const db = readDB();
    const newPackage = {
      id: `PKG${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      duration: Number(duration) || 9,
      price: numPrice,
      airline: airline || 'Saudia Airlines',
      hotel: hotel || '5 Bintang',
      quota: numQuota,
      booked: numBooked,
      status: finalStatus,
      agencyEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    db.packages = [newPackage, ...(db.packages || [])];
    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'CREATE_PACKAGE',
      details: `Created package "${newPackage.name}" (${newPackage.id}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({ success: true, package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    return res.status(500).json({ success: false, message: 'Failed to create package.' });
  }
});

// PUT /api/packages/:id - Super Admin & Travel Admin ONLY
router.put('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.packages.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const current = db.packages[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to update this package.' });
    }

    // Neutralize client input for agencyEmail
    const { agencyEmail: _, ...allowedBody } = req.body;
    const updated = { ...current, ...allowedBody, agencyEmail: current.agencyEmail || req.user.email, updatedAt: new Date().toISOString() };
    db.packages[index] = updated;
    writeDB(db);

    return res.json({ success: true, package: updated });
  } catch (error) {
    console.error('Error updating package:', error);
    return res.status(500).json({ success: false, message: 'Failed to update package.' });
  }
});

// DELETE /api/packages/:id - Super Admin & Travel Admin ONLY
router.delete('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.packages.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const current = db.packages[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to delete this package.' });
    }

    const deleted = db.packages.splice(index, 1)[0];
    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'DELETE_PACKAGE',
      details: `Deleted package "${deleted.name}" (${deleted.id}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, message: 'Package deleted successfully.' });
  } catch (error) {
    console.error('Error deleting package:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete package.' });
  }
});

export default router;

