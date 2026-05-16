import { create } from 'zustand';

/**
 * Authentication state store
 * Manages user identity, JWT token, and role
 */
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  userRole: null,
  isAuthenticated: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
  }),

  setToken: (token) => set({ token }),

  setUserRole: (role) => set({ userRole: role }),

  login: (user, role, token = null) => set({
    user,
    userRole: role,
    token,
    isAuthenticated: true,
  }),

  logout: () => {
    localStorage.removeItem('safecity_user');
    localStorage.removeItem('safecity_role');
    set({
      user: null,
      token: null,
      userRole: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
