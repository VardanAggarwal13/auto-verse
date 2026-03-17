const mongoose = require('mongoose');

const vehicleInspectionSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  engineStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  exteriorStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  interiorStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  tiresStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  notes: {
    type: String
  },
  inspectionDate: {
    type: Date,
    default: Date.now
  }
});

vehicleInspectionSchema.index({ vehicle: 1, inspectionDate: -1 });
vehicleInspectionSchema.index({ inspector: 1, inspectionDate: -1 });

module.exports = mongoose.model('VehicleInspection', vehicleInspectionSchema);
