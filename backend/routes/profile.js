const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;
    const userId = req.user.id;

    console.log('=== Profile Update Request ===');
    console.log('User ID:', userId);
    console.log('Body:', { name, email, phone, location });
    console.log('File uploaded:', req.file ? req.file.filename : 'No file');

    let query = 'UPDATE users SET name = $1, email = $2, phone = $3, location = $4';
    let params = [name, email, phone, location];

    // If photo was uploaded, add it to the update
    if (req.file) {
      query += ', profile_photo = $5';
      params.push(req.file.filename);
      console.log('Adding profile_photo to update:', req.file.filename);
    }

    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING id, name, email, phone, location, role, profile_photo, created_at';
    params.push(userId);

    console.log('Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);

    console.log('Update result:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
