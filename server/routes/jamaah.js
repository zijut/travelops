import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/jamaah
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let jamaah = db.jamaah || [];

    if (req.user.role !== 'Super Admin') {
      jamaah = jamaah.filter(j => !j.agencyEmail || j.agencyEmail.toLowerCase() === req.user.email.toLowerCase());
    }

    return res.json({ success: true, jamaah });
  } catch (error) {
    console.error('Error fetching jamaah:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch jamaah.' });
  }
});

// POST /api/jamaah
router.post('/', (req, res) => {
  try {
    const { name, phone, package: pkgName, departureDate, status, kloter, avatarUrl } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Pilgrim name is required.' });
    }

    const db = readDB();
    const newId = `JMH${(db.jamaah.length + 1).toString().padStart(3, '0')}`;
    const newPilgrim = {
      id: newId,
      name,
      phone: phone || '',
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${newId}/40/40`,
      package: pkgName || 'Umroh Berkah Ramadhan',
      departureDate: departureDate || '15 Mar 2026',
      status: status || 'Booked',
      kloter: kloter || 'Kloter A',
      agencyEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    db.jamaah = [newPilgrim, ...(db.jamaah || [])];
    
    // Auto-create initial visa record
    if (!db.visaRecords) db.visaRecords = {};
    db.visaRecords[newId] = {
      passport: 'PENDING',
      visa: 'PENDING',
      ktp: 'SUBMITTED',
      vaccine: 'PENDING',
      passportNumber: `A${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'CREATE_JAMAAH',
      details: `Registered new pilgrim ${newPilgrim.name} (${newPilgrim.id}) in ${newPilgrim.kloter}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({ success: true, jamaah: newPilgrim });
  } catch (error) {
    console.error('Error creating jamaah:', error);
    return res.status(500).json({ success: false, message: 'Failed to create pilgrim record.' });
  }
});

// PUT /api/jamaah/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.jamaah.findIndex(j => j.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Pilgrim not found.' });
    }

    const current = db.jamaah[index];
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
    db.jamaah[index] = updated;
    writeDB(db);

    return res.json({ success: true, jamaah: updated });
  } catch (error) {
    console.error('Error updating jamaah:', error);
    return res.status(500).json({ success: false, message: 'Failed to update pilgrim.' });
  }
});

// DELETE /api/jamaah/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.jamaah.findIndex(j => j.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Pilgrim not found.' });
    }

    const deleted = db.jamaah.splice(index, 1)[0];
    if (db.visaRecords && db.visaRecords[id]) {
      delete db.visaRecords[id];
    }
    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'DELETE_JAMAAH',
      details: `Deleted pilgrim ${deleted.name} (${deleted.id}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, message: 'Pilgrim record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting jamaah:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete pilgrim record.' });
  }
});

export default router;
