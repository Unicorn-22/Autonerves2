// client/src/services/showroomService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/showrooms';

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

// Get all showrooms with pagination
const getAllShowrooms = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(`?page=${page}&limit=${limit}`);
  return response.data;
};

// Get showroom by ID
const getShowroomById = async (id) => {
  const response = await axiosInstance.get(`/${id}`);
  return response.data;
};

// Get nearby showrooms
const getShowrooms = async (params) => {
  // Convert params to query string
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  }
  
  const response = await axiosInstance.get(`/nearby?${queryParams.toString()}`);
  return response.data;
};

// Create new showroom
const createShowroom = async (showroomData) => {
  const response = await axiosInstance.post('/', showroomData);
  return response.data;
};

// Update showroom
const updateShowroom = async (id, showroomData) => {
  const response = await axiosInstance.put(`/${id}`, showroomData);
  return response.data;
};

// Delete showroom
const deleteShowroom = async (id) => {
  const response = await axiosInstance.delete(`/${id}`);
  return response.data;
};

// Get vehicles for a showroom
const getShowroomVehicles = async (id, page = 1, limit = 10) => {
  const response = await axiosInstance.get(`/${id}/vehicles?page=${page}&limit=${limit}`);
  return response.data;
};

export default {
  getAllShowrooms,
  getShowroomById,
  getShowrooms,
  createShowroom,
  updateShowroom,
  deleteShowroom,
  getShowroomVehicles
};
