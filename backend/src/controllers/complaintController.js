import complaintService from '../services/complaintService.js';
import { success } from '../utils/response.js';

/**
 * Refactored Complaint Controller (Enterprise Grade)
 * Delegates business logic to complaintService.
 */

export const createComplaint = async (req, res, next) => {
  try {
    // req.user comes from firebaseAuth middleware
    // We use uid as the primary identifier or sync to get DB id
    const userId = req.user.uid; 
    const complaint = await complaintService.createComplaint(req.body, userId);
    res.status(201).json(success(complaint, 'Complaint filed successfully'));
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getComplaints(req.query);
    res.json(success(complaints));
  } catch (err) {
    next(err);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const complaints = await complaintService.getUserComplaints(userId);
    res.json(success(complaints));
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const authorityId = req.user.uid;
    const updated = await complaintService.updateStatus(id, status, authorityId);
    res.json(success(updated, 'Status updated successfully'));
  } catch (err) {
    next(err);
  }
};
