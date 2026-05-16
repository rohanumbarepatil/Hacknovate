import userQueries from '../database/queries/userQueries.js';
import logger from '../utils/logger.js';

/**
 * User Service - Handles user registration and profile sync.
 */
const userService = {
  async syncUser(firebaseUser) {
    const { uid, email, displayName, photoURL } = firebaseUser;
    
    let user = await userQueries.findByFirebaseUid(uid);
    
    if (!user) {
      logger.info(`New user registration: ${email}`);
      user = await userQueries.create({
        firebaseUid: uid,
        name: displayName || 'Citizen',
        email: email,
        role: 'citizen',
        avatarUrl: photoURL
      });
    } else {
      await userQueries.updateLastLogin(uid);
    }
    
    return user;
  },

  async getProfile(uid) {
    return await userQueries.findByFirebaseUid(uid);
  },

  async updateProfile(id, updates) {
    return await userQueries.update(id, updates);
  }
};

export default userService;
