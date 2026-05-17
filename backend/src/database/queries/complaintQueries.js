import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, '../complaints.json');

// Helper to load mock complaints database (MERN style, fully persistent)
function loadMockComplaints() {
  try {
    if (!fs.existsSync(dbFilePath)) {
      // Return a completely empty array by default to eliminate ALL fake/static/demo data!
      const initial = [];
      fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load mock complaints database:', err);
    return [];
  }
}

// Helper to save mock complaints database
function saveMockComplaints(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write mock complaints database:', err);
  }
}

/**
 * Parameterized and JSON-fallback complaint queries
 * Built strictly according to the production MERN Smart-City Complaint Schema
 */
const complaintQueries = {
  async create({ category, description, lat, lng, address, filedBy, zoneId, photoUrls, priorityScore, urgencyLabel, imageUrl }) {
    const latitude = parseFloat(lat || 18.5204);
    const longitude = parseFloat(lng || 73.8567);
    const severity = urgencyLabel || 'MEDIUM';
    const area = address || (latitude > 18.52 ? 'Shivajinagar, Pune' : 'Swargate, Pune');
    const finalImageUrl = imageUrl || (photoUrls && photoUrls[0]) || '/uploads/complaints/placeholder.jpg';

    // Generate unique complaint ID: COMP-PUNE-YYYY-NNNN
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `COMP-PUNE-${currentYear}-${randomNum}`;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initialWorkflow = [
      {
        status: 'Submitted',
        note: 'Complaint registered successfully via SafeCity Citizen Portal.',
        updatedBy: 'Citizen',
        timestamp
      }
    ];

    if (!pool) {
      const list = loadMockComplaints();
      
      const newComplaint = {
        id: newId,
        complaintId: newId,
        category: category || 'other',
        description: description || '',
        imageUrl: finalImageUrl,
        latitude,
        longitude,
        lat: latitude,
        lng: longitude,
        area,
        address: address || '',
        severity,
        status: 'Submitted',
        eta: 'Pending Review',
        assignedDepartment: 'Pending Routing',
        authorityNotes: [],
        workflowHistory: initialWorkflow,
        citizenId: filedBy || 'demo_citizen',
        filed_by: filedBy || 'demo_citizen',
        createdBy: filedBy || 'demo_citizen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      list.unshift(newComplaint);
      saveMockComplaints(list);
      return newComplaint;
    }

    const result = await pool.query(
      `INSERT INTO complaints (category, description, location, address, filed_by, zone_id, photo_urls, priority_score, urgency_label)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6, $7, $8, $9, $10)
       RETURNING *, ST_Y(location) as lat, ST_X(location) as lng`,
      [category, description, latitude, longitude, address, filedBy, zoneId, [finalImageUrl], priorityScore || 5, severity]
    );

    const row = result.rows[0];
    return {
      id: newId,
      complaintId: newId,
      category: row.category,
      description: row.description,
      latitude: parseFloat(row.lat),
      longitude: parseFloat(row.lng),
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      address: row.address,
      area: row.address || 'Urban Ward',
      imageUrl: finalImageUrl,
      severity: row.urgency_label,
      status: 'Submitted',
      eta: 'Pending Review',
      assignedDepartment: 'Pending Routing',
      authorityNotes: [],
      workflowHistory: initialWorkflow,
      citizenId: filedBy || 'demo_citizen',
      filed_by: filedBy || 'demo_citizen',
      createdBy: filedBy || 'demo_citizen',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  async getAll(filters = {}) {
    if (!pool) {
      let list = loadMockComplaints();
      if (filters.category) {
        list = list.filter(c => c.category === filters.category);
      }
      if (filters.status) {
        list = list.filter(c => c.status === filters.status);
      }
      return list;
    }

    let query = `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (filters.category) { query += ` AND category = $${idx++}`; params.push(filters.category); }
    if (filters.status) { query += ` AND status = $${idx++}`; params.push(filters.status); }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);
    return result.rows.map(row => {
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newId = `COMP-PUNE-${currentYear}-${randomNum}`;
      return {
        id: row.id.toString(),
        complaintId: newId,
        category: row.category,
        description: row.description,
        latitude: parseFloat(row.lat),
        longitude: parseFloat(row.lng),
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        address: row.address,
        area: row.address || 'Urban Ward',
        imageUrl: (row.photo_urls && row.photo_urls[0]) || '/uploads/complaints/placeholder.jpg',
        severity: row.urgency_label || 'MEDIUM',
        status: row.status || 'Submitted',
        eta: 'Pending Review',
        assignedDepartment: row.assigned_to || 'Pending Routing',
        authorityNotes: [],
        workflowHistory: [],
        citizenId: row.filed_by,
        filed_by: row.filed_by,
        createdBy: row.filed_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });
  },

  async getMine(userId) {
    if (!pool) {
      const list = loadMockComplaints();
      return list.filter(c => c.filed_by === userId || c.createdBy === userId || c.citizenId === userId);
    }
    const result = await pool.query(
      `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE filed_by = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(row => {
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newId = `COMP-PUNE-${currentYear}-${randomNum}`;
      return {
        id: row.id.toString(),
        complaintId: newId,
        category: row.category,
        description: row.description,
        latitude: parseFloat(row.lat),
        longitude: parseFloat(row.lng),
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        address: row.address,
        area: row.address || 'Urban Ward',
        imageUrl: (row.photo_urls && row.photo_urls[0]) || '/uploads/complaints/placeholder.jpg',
        severity: row.urgency_label || 'MEDIUM',
        status: row.status || 'Submitted',
        eta: 'Pending Review',
        assignedDepartment: row.assigned_to || 'Pending Routing',
        authorityNotes: [],
        workflowHistory: [],
        citizenId: row.filed_by,
        filed_by: row.filed_by,
        createdBy: row.filed_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });
  },

  async getById(id) {
    if (!pool) {
      const list = loadMockComplaints();
      return list.find(c => c.id === id || c.complaintId === id) || null;
    }
    const result = await pool.query(
      `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE id = $1`, [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `COMP-PUNE-${currentYear}-${randomNum}`;
    return {
      id: row.id.toString(),
      complaintId: newId,
      category: row.category,
      description: row.description,
      latitude: parseFloat(row.lat),
      longitude: parseFloat(row.lng),
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      address: row.address,
      area: row.address || 'Urban Ward',
      imageUrl: (row.photo_urls && row.photo_urls[0]) || '/uploads/complaints/placeholder.jpg',
      severity: row.urgency_label || 'MEDIUM',
      status: row.status || 'Submitted',
      eta: 'Pending Review',
      assignedDepartment: row.assigned_to || 'Pending Routing',
      authorityNotes: [],
      workflowHistory: [],
      citizenId: row.filed_by,
      filed_by: row.filed_by,
      createdBy: row.filed_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  async updateStatus(id, status, resolvedAt = null, options = {}) {
    const { note, assignedDepartment, eta, updatedBy } = options;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!pool) {
      const list = loadMockComplaints();
      const item = list.find(c => c.id === id || c.complaintId === id);
      if (item) {
        item.status = status;
        if (assignedDepartment) {
          item.assignedDepartment = assignedDepartment;
          item.assigned_to = assignedDepartment;
        }
        if (eta) item.eta = eta;
        
        // Append workflow history
        if (!item.workflowHistory) item.workflowHistory = [];
        
        // Get custom note or construct a professional default note
        let defaultNote = note;
        if (!defaultNote) {
          if (status === 'Submitted') defaultNote = 'Complaint filed successfully.';
          else if (status === 'Under Review') defaultNote = 'Grievance has been queued for AI-triage validation.';
          else if (status === 'Assigned') defaultNote = `Complaint assigned to ${assignedDepartment || item.assignedDepartment || 'respective division'}.`;
          else if (status === 'In Progress') defaultNote = 'Operations crew dispatched to location for resolution.';
          else if (status === 'Resolved') defaultNote = 'Problem successfully resolved. Resolution verified by municipal department.';
          else if (status === 'Rejected') defaultNote = 'Grievance rejected. Details insufficient or location out of bounds.';
          else defaultNote = `Complaint status transitioned to ${status}.`;
        }

        item.workflowHistory.push({
          status,
          note: defaultNote,
          updatedBy: updatedBy || 'Authority Command',
          timestamp
        });
        
        item.updatedAt = new Date().toISOString();
        saveMockComplaints(list);
      }
      return item;
    }

    const result = await pool.query(
      `UPDATE complaints SET status = $2, resolved_at = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status, resolvedAt]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      complaintId: id,
      category: row.category,
      description: row.description,
      latitude: parseFloat(row.lat || 18.5204),
      longitude: parseFloat(row.lng || 73.8567),
      lat: parseFloat(row.lat || 18.5204),
      lng: parseFloat(row.lng || 73.8567),
      address: row.address,
      area: row.address || 'Urban Ward',
      imageUrl: (row.photo_urls && row.photo_urls[0]) || '/uploads/complaints/placeholder.jpg',
      severity: row.urgency_label || 'MEDIUM',
      status: row.status || 'Submitted',
      eta: eta || 'Pending Review',
      assignedDepartment: assignedDepartment || row.assigned_to || 'Pending Routing',
      authorityNotes: [],
      workflowHistory: [
        {
          status,
          note: note || `Status updated to ${status}.`,
          updatedBy: updatedBy || 'Authority Command',
          timestamp
        }
      ],
      citizenId: row.filed_by,
      filed_by: row.filed_by,
      createdBy: row.filed_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  async assignTo(id, assignedTo, options = {}) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!pool) {
      const list = loadMockComplaints();
      const item = list.find(c => c.id === id || c.complaintId === id);
      if (item) {
        item.assigned_to = assignedTo;
        item.assignedDepartment = assignedTo;
        item.status = 'Assigned';
        item.eta = options.eta || '24 Hours';
        
        if (!item.workflowHistory) item.workflowHistory = [];
        item.workflowHistory.push({
          status: 'Assigned',
          note: options.note || `Complaint assigned to ${assignedTo}.`,
          updatedBy: 'Authority Command',
          timestamp
        });
        
        item.updatedAt = new Date().toISOString();
        saveMockComplaints(list);
      }
      return item;
    }
    const result = await pool.query(
      `UPDATE complaints SET assigned_to = $2, status = 'Assigned', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, assignedTo]
    );
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      complaintId: id,
      category: row.category,
      description: row.description,
      latitude: parseFloat(row.lat || 18.5204),
      longitude: parseFloat(row.lng || 73.8567),
      lat: parseFloat(row.lat || 18.5204),
      lng: parseFloat(row.lng || 73.8567),
      address: row.address,
      area: row.address || 'Urban Ward',
      imageUrl: (row.photo_urls && row.photo_urls[0]) || '/uploads/complaints/placeholder.jpg',
      severity: row.urgency_label || 'MEDIUM',
      status: 'Assigned',
      eta: options.eta || '24 Hours',
      assignedDepartment: assignedTo,
      authorityNotes: [],
      workflowHistory: [
        {
          status: 'Assigned',
          note: options.note || `Complaint assigned to ${assignedTo}.`,
          updatedBy: 'Authority Command',
          timestamp
        }
      ],
      citizenId: row.filed_by,
      filed_by: row.filed_by,
      createdBy: row.filed_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};

export default complaintQueries;
