import { db } from '../config/firebase-admin.js';

export const roleGuard = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(403).json({ error: 'User profile not found' });
      }

      const userData = userDoc.data();
      
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.userRole = userData.role;
      next();
    } catch (error) {
      console.error('Role guard error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
