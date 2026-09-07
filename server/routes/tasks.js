import express from 'express';
import { readDB, writeDB, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const db = readDB();
    let tasks = db.tasks || [];

    if (req.user.role !== 'Super Admin') {
      tasks = tasks.filter(t => !t.agencyEmail || t.agencyEmail.toLowerCase() === req.user.email.toLowerCase());
    }

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks
router.post('/', (req, res) => {
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

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const current = db.tasks[index];
    const updated = { ...current, ...req.body };
    db.tasks[index] = updated;
    writeDB(db);

    return res.json({ success: true, task: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
});

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    db.tasks[index].completed = !db.tasks[index].completed;
    writeDB(db);

    return res.json({ success: true, task: db.tasks[index] });
  } catch (error) {
    console.error('Error toggling task:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
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
