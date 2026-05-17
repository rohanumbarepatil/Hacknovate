import { create } from 'zustand';

/**
 * Notification state store
 * Manages in-app notification queue and unread count
 */
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      },
      ...state.notifications,
    ].slice(0, 50), // Keep max 50 notifications
    unreadCount: state.unreadCount + 1,
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  markCategoryAsRead: (category) => set((state) => {
    const unreadInCategory = state.notifications.filter(
      (n) => !n.read && n.category === category
    ).length;

    return {
      notifications: state.notifications.map((n) =>
        n.category === category ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - unreadInCategory),
    };
  }),

  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0,
  }),
}));

export default useNotificationStore;
