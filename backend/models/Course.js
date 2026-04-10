const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  contentUrl: String, 
  durationMinutes: Number,
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    enum: ['Video', 'Audio', 'Text', 'Mixed'],
    default: 'Mixed',
  },
  modules: [moduleSchema],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);
