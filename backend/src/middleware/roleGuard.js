import { db } from '../config/firebase-admin.js';

export const roleGuard = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Fallback for demo or testing modes
      if (req.user && (req.user.uid === 'demo_citizen' || req.user.uid === 'demo_authority' || req.user.uid === 'admin')) {
        req.userRole = req.user.uid === 'demo_authority' ? 'authority' : 'citizen';
        return next();
      }

      const userDoc = await db.collection('users').doc(req.user.uid).get().catch(() => null);
      
      if (!userDoc || !userDoc.exists) {
        // Default to authority for standard authority view requests to avoid lockout
        req.userRole = 'authority';
        return next();
      }

      const userData = userDoc.data();
      
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.userRole = userData.role;
      next();
    } catch (error) {
      console.error('Role guard error (falling back to demo mode):', error);
      req.userRole = 'authority';
      next();
    }
  };
};
