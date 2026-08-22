// client/src/utils/mapUtils.js
// Helper functions for Google Maps integration

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Converts degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
export const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

/**
 * Gets the user's current location
 * @returns {Promise} A promise that resolves to an object containing lat and lng
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  });
};

/**
 * Gets a default location (used when geolocation fails)
 * @returns {Object} Object containing default lat and lng
 */
export const getDefaultLocation = () => {
  // Default to Bangalore, India
  return { lat: 12.9716, lng: 77.5946 };
};

/**
 * Formats an address for display
 * @param {Object} showroom - Showroom object with address fields
 * @returns {string} Formatted address
 */
export const formatAddress = (showroom) => {
  if (!showroom) return '';
  
  const parts = [];
  if (showroom.address) parts.push(showroom.address);
  if (showroom.city) parts.push(showroom.city);
  if (showroom.state) parts.push(showroom.state);
  
  return parts.join(', ');
};

/**
 * Gets Google Maps directions URL
 * @param {Array} coordinates - [lng, lat] array from showroom location
 * @returns {string} Google Maps directions URL
 */
export const getDirectionsUrl = (start, end) => {
  if (!start || !end || end.length !== 2) return '';
  
  return `https://www.openstreetmap.org/directions?route=${start.lat}%2C${start.lng}%3B${end[1]}%2C${end[0]}`;
};

/**
 * Returns a Google Maps search URL for the provided coordinates.
 * This opens the location in the Google Maps web or mobile app.
 * @param {Array} coordinates - [lng, lat]
 * @returns {string} Google Maps search URL
 */
export const getGoogleMapsUrl = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) return '';

  const [lng, lat] = coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};
