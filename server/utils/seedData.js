// server/utils/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Showroom = require('../models/Showroom');
const Vehicle = require('../models/Vehicle');
const connectDB = require('../config/db');
require('dotenv').config();

// Mock data
const mockUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Dealer User',
    email: 'dealer@example.com',
    password: 'dealer123',
    role: 'dealer'
  },
  {
    name: 'Buyer User',
    email: 'buyer@example.com',
    password: 'buyer123',
    role: 'buyer'
  }
];

const mockShowrooms = [
  {
    name: 'Premium Motors',
    address: '123 Main Street',
    city: 'Bangalore',
    state: 'Karnataka',
    location: {
      type: 'Point',
      coordinates: [77.580643, 12.972442] // [longitude, latitude]
    },
    phone: '9876543210',
    email: 'info@premiummotors.com',
    hours: '9:00 AM - 7:00 PM',
    vehicleTypes: ['car', 'bike'],
    description: 'Premium Motors offers a wide range of luxury vehicles with exceptional service.'
  },
  // {
  //   name: 'SAFETY MOTORS YAMAHA',
  //   address: '270, 1, Erode Road, Ram Nagar, Perundurai, Tamil Nadu 638052',
  //   city:'Erode',
  //   state: 'Tamil Nadu',
  //   location:{
  //     type: 'point',
  //     coordinates:[11.1085° N,77.3411° E]
  //   },
  // }
];

// Car brands and models
const carBrands = [
  {
    name: 'Toyota',
    models: ['Corolla', 'Camry', 'Innova', 'Fortuner']
  },
  {
    name: 'Honda',
    models: ['City', 'Civic', 'Accord', 'CR-V']
  },
  {
    name: 'Hyundai',
    models: ['i10', 'i20', 'Creta', 'Tucson']
  },
  {
    name: 'Maruti Suzuki',
    models: ['Swift', 'Baleno', 'Dzire', 'Ertiga']
  }
];

// Bike brands and models
const bikeBrands = [
  {
    name: 'Hero',
    models: ['Splendor', 'Passion', 'Glamour', 'Xpulse']
  },
  {
    name: 'Bajaj',
    models: ['Pulsar', 'Dominar', 'Avenger', 'Platina']
  },
  {
    name: 'Honda',
    models: ['Activa', 'Shine', 'Unicorn', 'Hornet']
  },
  {
    name: 'Royal Enfield',
    models: ['Classic 350', 'Bullet', 'Himalayan', 'Interceptor']
  }
];

// Generate random vehicles for each showroom
const generateVehicles = (showrooms) => {
  const vehicles = [];
  
  showrooms.forEach(showroom => {
    // Determine vehicle types to generate based on showroom types
    const types = showroom.vehicleTypes;
    
    // Generate vehicles for each type
    types.forEach(type => {
      // Get relevant brands and models
      const brands = type === 'car' ? carBrands : bikeBrands;
      
      // Generate random vehicles
      brands.forEach(brand => {
        brand.models.forEach(model => {
          // Not all models will be available in each showroom
          if (Math.random() > 0.3) {
            const basePrice = type === 'car' ? 500000 : 80000; // Base price: 5L for cars, 80K for bikes
            const variance = type === 'car' ? 2000000 : 200000; // Price variance: 20L for cars, 2L for bikes
            
            vehicles.push({
              type,
              brand: brand.name,
              model,
              year: 2020 + Math.floor(Math.random() * 4), // 2020-2023
              price: basePrice + Math.floor(Math.random() * variance),
              showroom: showroom._id,
              images: [
                `https://via.placeholder.com/640x480.png?text=${encodeURIComponent(brand.name + ' ' + model)}`
              ],
              description: `The ${brand.name} ${model} offers exceptional performance and reliability. Visit ${showroom.name} for a test drive today.`,
              specifications: {
                engine: type === 'car' ? '1.5L - 2.0L' : '150cc - 200cc',
                transmission: type === 'car' ? (Math.random() > 0.5 ? 'Automatic' : 'Manual') : 'Manual',
                mileage: type === 'car' ? `${14 + Math.floor(Math.random() * 10)} km/l` : `${40 + Math.floor(Math.random() * 20)} km/l`,
                fuelType: type === 'car' ? (Math.random() > 0.3 ? 'Petrol' : 'Diesel') : 'Petrol',
                seatingCapacity: type === 'car' ? 5 : 2,
                colors: ['Red', 'Black', 'White', 'Blue', 'Silver'].slice(0, 3 + Math.floor(Math.random() * 3)),
                features: [
                  ...(type === 'car' 
                    ? ['AC', 'Power Steering', 'Power Windows', 'Central Locking', 'Airbags', 'ABS'] 
                    : ['Disc Brakes', 'Electric Start', 'LED Headlights', 'Digital Console', 'ABS']).slice(0, 3 + Math.floor(Math.random() * 4))
                ]
              },
              available: Math.random() > 0.1 // 90% vehicles available
            });
          }
        });
      });
    });
  });
  
  return vehicles;
};

// Seed data function
const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Showroom.deleteMany();
    await Vehicle.deleteMany();
    
    console.log('Cleared existing data');
    
    // Create users
    const users = await Promise.all(
      mockUsers.map(async user => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return new User({
          ...user,
          password: hashedPassword
        }).save();
      })
    );
    
    console.log('Created users');
    
    // Get dealer user
    const dealerUser = users.find(user => user.role === 'dealer');
    
    // Create showrooms
    const showrooms = await Promise.all(
      mockShowrooms.map(showroom => (
        new Showroom({
          ...showroom,
          owner: dealerUser._id
        }).save()
      ))
    );
    
    console.log('Created showrooms');
    
    // Generate and create vehicles
    const vehicleData = generateVehicles(showrooms);
    await Vehicle.insertMany(vehicleData);
    
    console.log(`Created ${vehicleData.length} vehicles`);
    
    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
