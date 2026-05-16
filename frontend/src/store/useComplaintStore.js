import { create } from 'zustand';

/**
 * Complaint state store
 * Manages citizen complaints with status tracking
 */
const useComplaintStore = create((set) => ({
  complaints: [],
  myComplaints: [],
  loading: false,
  error: null,

  setComplaints: (complaints) => set({ complaints, loading: false }),

  setMyComplaints: (myComplaints) => set({ myComplaints }),

  addComplaint: (complaint) => set((state) => ({
    complaints: [complaint, ...state.complaints],
  })),

  updateComplaintStatus: (id, status) => set((state) => ({
    complaints: state.complaints.map((c) =>
      c.id === id ? { ...c, status } : c
    ),
    myComplaints: state.myComplaints.map((c) =>
      c.id === id ? { ...c, status } : c
    ),
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));

export default useComplaintStore;
