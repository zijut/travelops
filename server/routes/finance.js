import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken, requireRole, checkAgencyOwnership, ROLES } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
// Restricted to Super Admin and Travel Admin ONLY (Ops Staff and Field Agent get 403 Forbidden)
router.use(requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN));

// GET /api/finance
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let finance = db.finance || [];

    if (req.user.role !== ROLES.SUPER_ADMIN) {
      finance = finance.filter(f => checkAgencyOwnership(req, f.agencyEmail));
    }

    return res.json({ success: true, finance });
  } catch (error) {
    console.error('Error fetching finance ledger:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch finance ledger.' });
  }
});

// GET /api/finance/summary
router.get('/summary', (req, res) => {
  try {
    const db = readDB();
    let finance = db.finance || [];

    if (req.user.role !== ROLES.SUPER_ADMIN) {
      finance = finance.filter(f => checkAgencyOwnership(req, f.agencyEmail));
    }


    let totalIncome = 0;
    let totalExpense = 0;
    let pendingTransactions = 0;
    let completedTransactions = 0;

    finance.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      if (tx.status === 'COMPLETED') {
        completedTransactions++;
        if (tx.type === 'INCOME') totalIncome += amount;
        if (tx.type === 'EXPENSE') totalExpense += amount;
      } else if (tx.status === 'PENDING') {
        pendingTransactions++;
      }
    });

    return res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        pendingTransactions,
        completedTransactions
      }
    });
  } catch (error) {
    console.error('Error calculating finance summary:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate finance summary.' });
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

    const current = db.finance[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to delete this transaction.' });
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

