const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return !this.firebaseUid; }, // Password only required if not Google login
    minlength: 6
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null/missing values
  },
  role: {
    type: String,
    enum: ['customer', 'dealer', 'admin', 'staff'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  resetPasswordTokenHash: {
    type: String,
    default: ''
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
