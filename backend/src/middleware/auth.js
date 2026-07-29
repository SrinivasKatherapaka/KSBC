import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_banking_erp_2026';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User inactive or invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired token' });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Admin & CFO Executive have full cross-department clearance across all API endpoints
    if (
      req.user.role === 'admin' || 
      req.user.role === 'cfo_executive' || 
      roles.length === 0 || 
      roles.includes(req.user.role)
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access Denied: Required role [${roles.join(', ')}]. Your role is '${req.user.role}'`
    });
  };
};
