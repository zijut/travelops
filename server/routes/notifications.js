import express from 'express';
import { readDB, writeDB } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/notifications
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let notifications = db.notifications || [];

    if (req.user.role !== 'Super Admin') {
      notifications = notifications.filter(n => !n.agencyEmail || n.agencyEmail.toLowerCase() === req.user.email.toLowerCase());
    }

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications
router.post('/', (req, res) => {
  try {
    const { titleEn, titleId, descEn, descId, type } = req.body;

    const db = readDB();
    const newNotif = {
      id: Date.now().toString(),
      titleEn: titleEn || 'System Notification',
      titleId: titleId || 'Notifikasi Sistem',
      descEn: descEn || '',
      descId: descId || '',
      timestamp: 'Baru saja',
      read: false,
      type: type || 'info',
      agencyEmail: req.user.email
    };

    db.notifications = [newNotif, ...(db.notifications || [])];
    writeDB(db);

    return res.status(201).json({ success: true, notification: newNotif });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ success: false, message: 'Failed to create notification.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const notif = (db.notifications || []).find(n => n.id === id);

    if (notif) {
      notif.read = true;
      writeDB(db);
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', (req, res) => {
  try {
    const db = readDB();
    const email = req.user.email.toLowerCase();

    (db.notifications || []).forEach(n => {
      if (req.user.role === 'Super Admin' || !n.agencyEmail || n.agencyEmail.toLowerCase() === email) {
        n.read = true;
      }
    });

    writeDB(db);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
});

export default router;
