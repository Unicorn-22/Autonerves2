import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useComparison } from '../contexts/ComparisonContext';
import vehicleService from '../services/vehicleService';
import toast from 'react-hot-toast';
import { getVehicleImage } from '../utils/vehicleImages';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { selectedVehicles, toggleComparison } = useComparison();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  
  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getVehicleById(id);
        setVehicle(data);
        
        // Fetch similar vehicles (same type and brand)
        fetchSimilarVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleData();
  }, [id]);
  
  const fetchSimilarVehicles = async (vehicleData) => {
    try {
      // Search for similar vehicles (same type and brand, excluding current vehicle)
      const searchParams = {
        type: vehicleData.type,
        brand: vehicleData.brand,
        excludeId: vehicleData._id,
        limit: 3
      };
      
      const results = await vehicleService.searchVehicles(searchParams);
      setSimilarVehicles(results);
    } catch (error) {
      console.error('Error fetching similar vehicles:', error);
    }
  };
  
  const handleGetDirections = () => {
    if (vehicle && vehicle.showroom && vehicle.showroom.location) {
      const coords = vehicle.showroom.location.coordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`, '_blank');
    } else {
      toast.error('Showroom location information is not available');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-6">{error || 'Vehicle not found'}</p>
        <Link 
          to="/search" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to Search
        </Link>
      </div>
    );
  }
  
  const images = [getVehicleImage(vehicle.brand, vehicle.model)];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/search" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </Link>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vehicle Images */}
          <div className="p-6">
            <div className="mb-4 h-64 md:h-80 overflow-hidden rounded-lg">
              <img
                src={images[activeImage]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-contain"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`h-16 w-16 flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden ${
                      activeImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Vehicle Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-gray-500 mb-4">{vehicle.year}</p>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600">₹{vehicle.price.toLocaleString()}</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {vehicle.specifications.engine && (
                  <div>
                    <span className="text-gray-600 text-sm">Engine:</span>
                    <p>{vehicle.specifications.engine}</p>
                  </div>
                )}
                {vehicle.specifications.transmission && (
                  <div>
                    <span className="text-gray-600 text-sm">Transmission:</span>
                    <p>{vehicle.specifications.transmission}</p>
                  </div>
                )}
                {vehicle.specifications.mileage && (
                  <div>
                    <span className="text-gray-600 text-sm">Mileage:</span>
                    <p>{vehicle.specifications.mileage}</p>
                  </div>
                )}
                {vehicle.specifications.fuelType && (
                  <div>
                    <span className="text-gray-600 text-sm">Fuel Type:</span>
                    <p>{vehicle.specifications.fuelType}</p>
                  </div>
                )}
                {vehicle.specifications.seatingCapacity && (
                  <div>
                    <span className="text-gray-600 text-sm">Seating:</span>
                    <p>{vehicle.specifications.seatingCapacity} Persons</p>
                  </div>
                )}
              </div>
            </div>
            
            {vehicle.specifications.colors && vehicle.specifications.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Available Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.specifications.colors.map((color, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {vehicle.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{vehicle.description}</p>
              </div>
            )}
            
            {vehicle.specifications.features && vehicle.specifications.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {vehicle.specifications.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Showroom Information */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Available at</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h4 className="text-lg font-medium">{vehicle.showroom.name}</h4>
                <p className="text-gray-600">{vehicle.showroom.address}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {vehicle.showroom.phone}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {vehicle.showroom.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link
                  to={`/showroom/${vehicle.showroom._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition inline-block"
                >
                  View Showroom
                </Link>
                <button
                  onClick={handleGetDirections}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar Vehicles */}
      {similarVehicles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarVehicles.map(similarVehicle => (
              <div key={similarVehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={getVehicleImage(similarVehicle.brand, similarVehicle.model)}
                    alt={`${similarVehicle.brand} ${similarVehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{similarVehicle.brand} {similarVehicle.model}</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">₹{similarVehicle.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Showroom:</span>
                    <span>{similarVehicle.showroom.name}</span>
                  </div>
                  <Link 
                    to={`/vehicle/${similarVehicle._id}`}
                    className="block w-full py-2 bg-blue-600 text-center text-white rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add to Compare Button (Fixed at Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center shadow-lg">
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please log in or register to compare vehicles.");
              navigate('/register');
            } else {
              toggleComparison(vehicle);
              toast.success(
                `${vehicle.brand} ${vehicle.model} ${
                  selectedVehicles.some((v) => v._id === vehicle._id)
                    ? 'removed from'
                    : 'added to'
                } comparison.`
              );
            }
          }}
          className={`px-6 py-2 rounded-md transition ${
            selectedVehicles.some((v) => v._id === vehicle._id)
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {selectedVehicles.some((v) => v._id === vehicle._id)
            ? 'Remove from Compare'
            : 'Add to Compare'}
        </button>
      </div>
    </div>
  );
};

export default VehicleDetails;
