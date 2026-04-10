const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// @route   GET /api/courses
// @desc    Fetch all courses (returns mock courses if none exist in DB)
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true });
    
    // For the MVP phase, if the database is empty, return a mock array of courses
    if (courses.length === 0) {
      return res.status(200).json([
        {
          _id: 'mock_1',
          title: 'Introduction to Mobile Networking',
          description: 'Learn the basic architecture of how mobile networks operate.',
          format: 'Video',
          modules: [
            { title: 'What is 4G?', durationMinutes: 10 },
            { title: 'Using the Internet Safely', durationMinutes: 15 }
          ]
        },
        {
          _id: 'mock_2',
          title: 'Basic Financial Literacy',
          description: 'Understanding savings, budgeting, and simple basic accounting strategies.',
          format: 'Audio',
          modules: [
            { title: 'Why Save Money?', durationMinutes: 5 },
            { title: 'Basic Budgeting Rules', durationMinutes: 12 }
          ]
        }
      ]);
    }
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
