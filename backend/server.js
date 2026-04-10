const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON payloads

// Mount Routers
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const translateRoutes = require('./routes/translateRoutes');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/translate', translateRoutes);

// Global Unhandled Error Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error (Audit Fixed)', error: err.message });
});

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('Skill Up Learning App Backend is running...');
});

const PORT = process.env.PORT || 5000;

// Prevent port occupation and db binds when Supertest invokes the module
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
