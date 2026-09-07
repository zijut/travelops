import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/finance
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let finance = db.finance || [];

    if (req.user.role !== 'Super Admin') {
      finance = finance.filter(f => !f.agencyEmail || f.agencyEmail.toLowerCase() === req.user.email.toLowerCase());
    }

    return res.json({ success: true, finance });
  } catch (error) {
    console.error('Error fetching finance ledger:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch finance ledger.' });
  }
});

// POST /api/finance
router.post('/', (req, res) => {
  try {
    const { category, description, amount, type, status, date } = req.body;

    if (!category || !amount || !type) {
      return res.status(400).json({ success: false, message: 'Category, amount, and type are required.' });
    }

    const db = readDB();
    const newTx = {
      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
      date: date || new Date().toISOString().split('T')[0],
      category,
      description: description || '',
      amount: Number(amount) || 0,
      type: type.toUpperCase(),
      status: status || 'COMPLETED',
      agencyEmail: req.user.email
    };

    db.finance = [newTx, ...(db.finance || [])];
    writeDB(db);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'FINANCE_TRANSACTION',
      details: `Recorded finance ${newTx.type} of Rp ${newTx.amount.toLocaleString()} for "${newTx.description}".`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({ success: true, transaction: newTx });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to record transaction.' });
  }
});

// DELETE /api/finance/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.finance.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    db.finance.splice(index, 1);
    writeDB(db);

    return res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
});

export default router;
