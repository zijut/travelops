import express from 'express';
import { readDB, writeDB, findJamaahById, logAudit } from '../db.js';
import { authenticateToken, requireRole, checkAgencyOwnership, ROLES } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/visa
router.get('/', (req, res) => {
  try {
    const db = readDB();
    const allVisaRecords = db.visaRecords || {};
    const jamaahList = db.jamaah || [];

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return res.json({ success: true, visaRecords: allVisaRecords });
    }

    // Filter visa records to only include pilgrims belonging to requester's agency
    const filteredVisaRecords = {};
    jamaahList.forEach(j => {
      if (checkAgencyOwnership(req, j.agencyEmail) && allVisaRecords[j.id]) {
        filteredVisaRecords[j.id] = allVisaRecords[j.id];
      }
    });

    return res.json({ success: true, visaRecords: filteredVisaRecords });
  } catch (error) {
    console.error('Error fetching visa records:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visa records.' });
  }
});

// GET /api/visa/:jamaahId
router.get('/:jamaahId', (req, res) => {
  try {
    const { jamaahId } = req.params;
    const db = readDB();
    const pilgrim = findJamaahById(jamaahId);

    if (!pilgrim || !checkAgencyOwnership(req, pilgrim.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to this pilgrim visa record.' });
    }

    const visaRecords = db.visaRecords || {};
    const record = visaRecords[jamaahId];

    if (!record) {
      return res.status(404).json({ success: false, message: `Visa record for pilgrim ID ${jamaahId} not found.` });
    }

    return res.json({ success: true, visaRecord: record });
  } catch (error) {
    console.error('Error fetching visa record:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visa record.' });
  }
});

// PUT /api/visa/:jamaahId - Super Admin, Travel Admin, Ops Staff ONLY
router.put('/:jamaahId', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN, ROLES.OPS_STAFF), (req, res) => {
  try {
    const { jamaahId } = req.params;
    const db = readDB();
    const pilgrim = findJamaahById(jamaahId);

    if (pilgrim && !checkAgencyOwnership(req, pilgrim.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to update this pilgrim visa record.' });
    }

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

