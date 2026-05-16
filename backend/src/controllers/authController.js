import userService from '../services/userService.js';
import { success } from '../utils/response.js';

/**
 * Auth Controller
 */
export const syncUser = async (req, res, next) => {
  try {
    // req.user is decoded from firebaseAuth middleware
    const user = await userService.syncUser(req.user);
    res.json(success(user, 'User synchronized successfully'));
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.uid);
    res.json(success(profile));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    res.json(success(updated, 'Profile updated successfully'));
  } catch (err) {
    next(err);
  }
};
