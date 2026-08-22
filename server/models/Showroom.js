const mongoose = require('mongoose');

const showroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hours: {
    type: String,
    default: '9:00 AM - 7:00 PM'
  },
  vehicleTypes: {
    type: [String],
    enum: ['car', 'bike'],
    required: true
  },
  photos: [String],
  description: String,
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
showroomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Showroom', showroomSchema);
