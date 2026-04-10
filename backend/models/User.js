const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'superadmin'],
    default: 'user',
  },
  password: {
    type: String, // bcrypt hash — only set for superadmin accounts
    select: false, // never returned in normal queries
  },
  onboardingStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  onboardingData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('User', userSchema);
