import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/visa
router.get('/', (req, res) => {
  try {
    const db = readDB();
    const visaRecords = db.visaRecords || {};
    return res.json({ success: true, visaRecords });
  } catch (error) {
    console.error('Error fetching visa records:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visa records.' });
  }
});

// PUT /api/visa/:jamaahId
router.put('/:jamaahId', (req, res) => {
  try {
    const { jamaahId } = req.params;
    const db = readDB();

    if (!db.visaRecords) db.visaRecords = {};
    const current = db.visaRecords[jamaahId] || {};
    const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
    db.visaRecords[jamaahId] = updated;

    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'UPDATE_VISA',
      details: `Updated visa verification status for pilgrim ID ${jamaahId}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, visaRecord: updated });
  } catch (error) {
    console.error('Error updating visa record:', error);
    return res.status(500).json({ success: false, message: 'Failed to update visa record.' });
  }
});

export default router;
