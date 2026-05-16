import { auth } from '../config/firebase-admin.js';

export const firebaseAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    // Allow demo mode without token
    if (!token) {
      req.user = { uid: 'demo_citizen' };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    // Fallback to demo mode
    req.user = { uid: 'demo_citizen' };
    next();
  }
};
