const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @route   POST /api/users/profile
// @desc    Create or update user onboarding profile
// @access  Public (Will need Firebase Auth middleware check eventually)
router.post('/profile', async (req, res) => {
  try {
    const { firebaseUid, email, onboardingData } = req.body;
    
    if (!firebaseUid || !email) {
      return res.status(400).json({ message: 'Firebase UID and email are required.' });
    }

    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user profile
      user.onboardingData = { ...user.onboardingData, ...onboardingData };
      user.onboardingStatus = 'completed';
      await user.save();
      return res.status(200).json({ message: 'Profile updated successfully', user });
    }

    // Create new user profile
    user = await User.create({
      firebaseUid,
      email,
      onboardingData,
      onboardingStatus: 'completed'
    });

    res.status(201).json({ message: 'Profile created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/profile/:uid
// @desc    Get user profile by Firebase UID
// @access  Public
router.get('/profile/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/admin/all
// @desc    Get all users and their onboarding data (Superadmin only)
// @access  Private/Superadmin (Will need Role-based Auth middleware eventually)
router.get('/admin/all', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/admin/login
// @desc    Authenticate superadmin with email + password, return JWT
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email — explicitly include password (select:false by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Must be a superadmin
    if (user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Not a superadmin account.' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ message: 'No password set for this account. Contact the system administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.status(200).json({ token, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/admin/seed
// @desc    Create or reset the superadmin account (run once during setup)
// @access  Public — REMOVE or protect this route after initial setup!
router.post('/admin/seed', async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    // Basic guard so this can't be called without knowing the secret
    if (secretKey !== (process.env.ADMIN_SEED_SECRET || 'SKILLUP_SEED_2024')) {
      return res.status(403).json({ message: 'Invalid seed secret.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        email: email.toLowerCase().trim(),
        firebaseUid: `admin_${Date.now()}`,
        role: 'superadmin',
        password: hashed,
        onboardingStatus: 'completed',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: `Superadmin account ready for ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
