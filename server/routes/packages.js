import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/packages
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let packages = db.packages || [];

    // Filter by agency if not Super Admin
    if (req.user.role !== 'Super Admin') {
      packages = packages.filter(p => !p.agencyEmail || p.agencyEmail.toLowerCase() === req.user.email.toLowerCase());
    }

    return res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch packages.' });
  }
});

// POST /api/packages
router.post('/', (req, res) => {
  try {
    const { name, duration, price, airline, hotel, quota, booked, status } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Package name and price are required.' });
    }

    const db = readDB();
    const newPackage = {
      id: `PKG${Date.now().toString().slice(-4)}`,
      name,
      duration: Number(duration) || 9,
      price: Number(price) || 0,
      airline: airline || 'Saudia Airlines',
      hotel: hotel || '5 Bintang',
      quota: Number(quota) || 50,
      booked: Number(booked) || 0,
      status: status || 'Draft',
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

// PUT /api/packages/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.packages.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const current = db.packages[index];
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
    db.packages[index] = updated;
    writeDB(db);

    return res.json({ success: true, package: updated });
  } catch (error) {
    console.error('Error updating package:', error);
    return res.status(500).json({ success: false, message: 'Failed to update package.' });
  }
});

// DELETE /api/packages/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.packages.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
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
