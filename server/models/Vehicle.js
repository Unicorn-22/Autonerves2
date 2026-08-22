const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['car', 'bike'],
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  showroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showroom',
    required: true
  },
  images: [String],
  description: String,
  specifications: {
    engine: String,
    transmission: String,
    mileage: String,
    fuelType: String,
    seatingCapacity: Number,
    colors: [String],
    features: [String]
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
vehicleSchema.index({ type: 1, brand: 1, model: 1 });
vehicleSchema.index({ showroom: 1 });
vehicleSchema.index({ price: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
