import jwt from 'jsonwebtoken';
import { findUserById } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'travelops-super-secret-jwt-key-2026-production';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }

    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'User account is currently suspended. Please contact administrator.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      agency: user.agency
    };
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        const user = findUserById(decoded.id);
        if (user && user.status !== 'Suspended') {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            agency: user.agency
          };
        }
      }
      next();
    });
  } else {
    next();
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role;
    // Super Admin has access to everything
    if (userRole === 'Super Admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
    });
  };
}
