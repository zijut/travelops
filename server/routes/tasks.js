import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken, requireRole, checkAgencyOwnership, ROLES } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let tasks = db.tasks || [];

    if (req.user.role !== ROLES.SUPER_ADMIN) {
      tasks = tasks.filter(t => checkAgencyOwnership(req, t.agencyEmail));
    }

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
});


// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const task = (db.tasks || []).find(t => t.id === id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (!checkAgencyOwnership(req, task.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to this task.' });
    }

    return res.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task details.' });
  }
});

// POST /api/tasks - Super Admin, Travel Admin, Ops Staff ONLY
router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN, ROLES.OPS_STAFF), (req, res) => {
  try {
    const { title, category, dueDate, completed, assignee, priority, description, subtasks, kloter } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const db = readDB();
    const newTask = {
      id: Date.now().toString(),
      title,
      category: category || 'Pre-Departure',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      completed: Boolean(completed),
      assignee: assignee || req.user.name.split(' ')[0] || 'Admin',
      priority: priority || 'Medium',
      description: description || '',
      subtasks: subtasks || [],
      kloter: kloter || 'Kloter A',
      agencyEmail: req.user.email
    };

    db.tasks = [newTask, ...(db.tasks || [])];
    writeDB(db);

    return res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id - Super Admin, Travel Admin, Ops Staff ONLY
router.put('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN, ROLES.OPS_STAFF), (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const current = db.tasks[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to update this task.' });
    }

    const { agencyEmail: _, ...allowedBody } = req.body;
    const updated = { ...current, ...allowedBody, agencyEmail: current.agencyEmail || req.user.email };
    db.tasks[index] = updated;
    writeDB(db);

    return res.json({ success: true, task: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
});

// PATCH /api/tasks/:id/toggle - Super Admin, Travel Admin, Ops Staff, Field Agent
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const current = db.tasks[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to toggle this task.' });
    }

    db.tasks[index].completed = !db.tasks[index].completed;
    writeDB(db);

    return res.json({ success: true, task: db.tasks[index] });
  } catch (error) {
    console.error('Error toggling task:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle task.' });
  }
});

// DELETE /api/tasks/:id - Super Admin & Travel Admin ONLY
router.delete('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.TRAVEL_ADMIN), (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const current = db.tasks[index];
    if (!checkAgencyOwnership(req, current.agencyEmail)) {
      return res.status(403).json({ success: false, message: 'Access denied to delete this task.' });
    }

    db.tasks.splice(index, 1);
    writeDB(db);

    return res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
});

export default router;

