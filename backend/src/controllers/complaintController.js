import complaintService from '../services/complaintService.js';
import { success } from '../utils/response.js';
import { io } from '../app.js';
import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

/**
 * Enterprise Grade Complaint Controller
 * Handles HTTP requests, multer media files, and triggers real-time Socket.IO broadcasts
 */

export const createComplaint = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    logger.info(`Incoming complaint submission from citizen: ${userId}`);

    // If file is uploaded via multer, map its public access URL
    let imageUrl = '/uploads/complaints/placeholder.jpg';
    if (req.file) {
      imageUrl = `/uploads/complaints/${req.file.filename}`;
      logger.success(`Image uploaded successfully to server: ${imageUrl}`);
    }

    // Build complete data payload
    const dataPayload = {
      ...req.body,
      imageUrl
    };

    // Save using service layer
    const complaint = await complaintService.createComplaint(dataPayload, userId);
    
    // Broadcast instantly to all active Authority Command Center dashboards via Socket.IO
    if (io) {
      logger.socket(`Broadcasting new complaint ${complaint.id} to authority dashboards...`);
      io.emit('authority_new_complaint', complaint);
      io.emit('complaintUpdated', complaint); // BROADCAST EVENT
      io.emit(SOCKET_EVENTS.COMPLAINT_NEW, complaint);
    }

    res.status(201).json(success(complaint, 'Complaint filed successfully and forwarded to city authorities.'));
  } catch (err) {
    logger.error(`Complaint creation failed: ${err.message}`);
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getComplaints(req.query);
    res.json(success(complaints));
  } catch (err) {
    logger.error(`Get complaints failed: ${err.message}`);
    next(err);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const complaints = await complaintService.getUserComplaints(userId);
    res.json(success(complaints));
  } catch (err) {
    logger.error(`Get user complaints failed: ${err.message}`);
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await complaintService.getComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json(success(complaint));
  } catch (err) {
    logger.error(`Get complaint by ID failed: ${err.message}`);
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const id = req.params.id || req.body.id || req.body.complaintId;
    const { status, note, assignedDepartment, eta } = req.body;
    const authorityId = req.user.uid;
    
    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Complaint ID and status are required' });
    }
    
    logger.info(`Authority ${authorityId} updating status of complaint ${id} to ${status}`);
    const updated = await complaintService.updateStatus(id, status, authorityId, { note, assignedDepartment, eta });
    
    // Broadcast status change in real time to both citizens and authorities
    if (io) {
      logger.socket(`Broadcasting complaint status update for ${id} -> ${status}...`);
      io.emit('complaint_status_updated', { id, status, updated });
      io.emit('complaintUpdated', updated); // REQUIRED BY THE USER REQUEST
      io.emit(SOCKET_EVENTS.COMPLAINT_STATUS, { id, status, updated });
    }

    res.json(success(updated, `Complaint status successfully updated to ${status}`));
  } catch (err) {
    logger.error(`Update complaint status failed: ${err.message}`);
    next(err);
  }
};
