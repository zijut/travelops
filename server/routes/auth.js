import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser, updateUser, logAudit } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, agency, role, region, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    // Check existing email
    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered. Please sign in.'
      });
    }

    const newUser = createUser({
      name,
      email,
      phone: phone || '',
      password,
      agency: agency || `${name} Group Travel`,
      role: role || 'Travel Admin',
      region: region || 'Indonesia & Saudi Arabia',
      address: address || `Kantor Pusat ${name}`
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAudit({
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTER',
      details: `New agency account registered for ${newUser.agency} (${newUser.email}).`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email address not found in our database.'
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an Administrator.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: 'FAILED_LOGIN',
        details: `Invalid password attempt for account ${user.email}.`,
        ipAddress: req.ip || '127.0.0.1',
        status: 'FAILED'
      });

      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    // Update last login
    updateUser(user.id, { lastLogin: new Date().toISOString() });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;

    logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      details: `User ${user.name} logged into ${user.agency || 'TravelOps'}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { password: _, ...userSafe } = user;
  return res.json({ success: true, user: userSafe });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, photo, agency, region, address, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (photo) updates.photo = photo;
    if (agency) updates.agency = agency;
    if (region) updates.region = region;
    if (address !== undefined) updates.address = address;
    if (password && password.trim().length >= 6) updates.password = password;

    const updatedUser = updateUser(req.user.id, updates);

    logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'PROFILE_UPDATE',
      details: `User profile updated for ${req.user.email}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  logAudit({
    userId: req.user.id,
    userName: req.user.name,
    role: req.user.role,
    action: 'USER_LOGOUT',
    details: `User ${req.user.name} logged out.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
