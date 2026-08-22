// client/src/services/vehicleService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles';

// Create axios instance with auth token
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all vehicles with pagination
const getAllVehicles = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`?page=${page}&limit=${limit}`);
  return response.data;
};

// Get vehicle by ID
const getVehicleById = async (id) => {
  const response = await axiosInstance.get(`/${id}`);
  return response.data;
};

// Search vehicles
const searchVehicles = async (searchParams) => {
  // Convert search params to query string
  const queryParams = new URLSearchParams();
  
  for (const key in searchParams) {
    if (searchParams[key] !== undefined && searchParams[key] !== '') {
      if (key === 'userLocation' && searchParams[key]) {
        queryParams.append('lat', searchParams[key].lat);
        queryParams.append('lng', searchParams[key].lng);
      } else if (key === 'priceRange' && Array.isArray(searchParams[key])) {
        queryParams.append('minPrice', searchParams[key][0]);
        queryParams.append('maxPrice', searchParams[key][1]);
      } else {
        queryParams.append(key, searchParams[key]);
      }
    }
  }
  
  const response = await axiosInstance.get(`/search?${queryParams.toString()}`);
  return response.data;
};

// Create new vehicle
const createVehicle = async (vehicleData) => {
  const response = await axiosInstance.post('/', vehicleData);
  return response.data;
};

// Update vehicle
const updateVehicle = async (id, vehicleData) => {
  const response = await axiosInstance.put(`/${id}`, vehicleData);
  return response.data;
};

// Delete vehicle
const deleteVehicle = async (id) => {
  const response = await axiosInstance.delete(`/${id}`);
  return response.data;
};

// Upload images for a vehicle
const uploadVehicleImages = async (id, formData) => {
  const response = await axiosInstance.post(`/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get brands for a vehicle type
const getBrands = async (vehicleType) => {
  const response = await axiosInstance.get(`/brands?type=${vehicleType}`);
  return response.data;
};

// Get models for a vehicle brand
const getModels = async (vehicleType, brand) => {
  const response = await axiosInstance.get(`/models?type=${vehicleType}&brand=${brand}`);
  return response.data;
};

export default {
  getAllVehicles,
  getVehicleById,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getBrands,
  getModels
};
