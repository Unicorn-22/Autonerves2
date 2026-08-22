// client/src/pages/VehicleSearch.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import { getUserLocation, getDefaultLocation } from '../utils/mapUtils';
import toast from 'react-hot-toast';
import { useComparison } from '../contexts/ComparisonContext';
import { getVehicleImage } from '../utils/vehicleImages';
import { AuthContext } from '../contexts/AuthContext';

const VehicleSearch = () => {
  const { selectedVehicles, toggleComparison } = useComparison();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({
    type: 'all', // 'all', 'car' or 'bike'
    brand: '',
    model: '',
    priceRange: [0, 10000000], // min and max price
    showroomId: '', // For filtering by a specific showroom
    radius: 25 // in km
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price-asc', 'price-desc'
  
  const initialSearchPerformed = useRef(false);

  // Parse query params from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const initialParams = {
      type: params.get('type') || 'all',
      brand: params.get('brand') || '',
      model: params.get('model') || '',
      showroomId: params.get('showroomId') || '',
      radius: parseInt(params.get('radius')) || 25,
    };
    
    // Parse price range if exists
    if (params.get('minPrice') || params.get('maxPrice')) {
      initialParams.priceRange = [
        params.get('minPrice') ? parseInt(params.get('minPrice')) : 0,
        params.get('maxPrice') ? parseInt(params.get('maxPrice')) : 10000000
      ];
    } else {
      initialParams.priceRange = [0, 10000000];
    }
    
    setSearchParams(initialParams);
    
    // Get user location
    getUserLocationData();
    
    // Load brands
    loadBrands(initialParams.type);
    
  }, [location.search]);

  useEffect(() => {
    if (userLocation && !initialSearchPerformed.current) {
      handleSearch(searchParams);
      initialSearchPerformed.current = true;
    }
  }, [userLocation, searchParams]);
  
  useEffect(() => {
    // Load models when brand changes
    if (searchParams.brand) {
      loadModels(searchParams.type, searchParams.brand);
    } else {
      setModels([]);
    }
  }, [searchParams.brand, searchParams.type]);
  
  const getUserLocationData = async () => {
    try {
      const position = await getUserLocation();
      setUserLocation(position);
    } catch (error) {
      console.error("Error obtaining location:", error);
      toast.error("Could not access your location. Using default location.");
      setUserLocation(getDefaultLocation());
    }
  };
  
  const loadBrands = async (vehicleType) => {
    try {
      const brandsData = await vehicleService.getBrands(vehicleType);
      setBrands(brandsData);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast.error("Error loading brands");
    }
  };
  
  const loadModels = async (vehicleType, brand) => {
    try {
      if (brand) {
        const modelsData = await vehicleService.getModels(vehicleType, brand);
        setModels(modelsData);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };
  
  const handleSearch = async (params = searchParams) => {
    setLoading(true);
    try {
      const searchData = {
        ...params,
        minPrice: params.priceRange[0],
        maxPrice: params.priceRange[1],
        ...(userLocation && { lat: userLocation.lat, lng: userLocation.lng })
      };
      

      
      const results = await vehicleService.searchVehicles(searchData);
      setVehicles(results);
      setTotalResults(results.length);
      
      // Sort results
      sortResults(results, sortBy);
    } catch (error) {
      console.error("Error searching vehicles:", error);
      toast.error("Error searching for vehicles");
      setVehicles([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset brand and model when type changes
      setSearchParams({
        ...searchParams,
        type: value,
        brand: '',
        model: ''
      });
      loadBrands(value);
    } else if (name === 'brand') {
      // Reset model when brand changes
      setSearchParams({
        ...searchParams,
        brand: value,
        model: ''
      });
    } else {
      setSearchParams({
        ...searchParams,
        [name]: value
      });
    }
  };
  
  const handlePriceChange = (index, value) => {
    const newPriceRange = [...searchParams.priceRange];
    newPriceRange[index] = parseInt(value);
    setSearchParams({
      ...searchParams,
      priceRange: newPriceRange
    });
  };
  
  const resetFilters = () => {
    setSearchParams({
      type: 'all',
      brand: '',
      model: '',
      priceRange: [0, 10000000],
      showroomId: '',
      radius: 25
    });
    
    // Update URL to remove query params
    navigate('/search', { replace: true });
    
    // Clear results
    setVehicles([]);
    setTotalResults(0);
  };
  
  const sortResults = (results = vehicles, sortMethod) => {
    let sortedResults = [...results];
    
    switch (sortMethod) {
      case 'distance':
        sortedResults.sort((a, b) => a.distance - b.distance);
        break;
      case 'price-asc':
        sortedResults.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedResults.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sortedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    
    setVehicles(sortedResults);
  };
  
  const handleSortChange = (e) => {
    const sortMethod = e.target.value;
    setSortBy(sortMethod);
    sortResults(vehicles, sortMethod);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Search Vehicles</h1>
      
      {/* Search and Filters Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Panel (Left Side) */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="md:hidden text-gray-500"
              >
                {filtersVisible ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className={`space-y-4 ${filtersVisible ? 'block' : 'hidden md:block'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <div className="flex space-x-1">
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${
                      searchParams.type === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'type', value: 'all' } })}
                  >
                    All
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${
                      searchParams.type === 'car'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'type', value: 'car' } })}
                  >
                    Cars
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${
                      searchParams.type === 'bike'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'type', value: 'bike' } })}
                  >
                    Bikes
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  name="brand"
                  value={searchParams.brand}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  name="model"
                  value={searchParams.model}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!searchParams.brand}
                >
                  <option value="">All Models</option>
                  {models.map((model, index) => (
                    <option key={index} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      value={searchParams.priceRange[0]}
                      onChange={(e) => handlePriceChange(0, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Min Price"
                      min="0"
                      step="10000"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={searchParams.priceRange[1]}
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Max Price"
                      min={searchParams.priceRange[0]}
                      step="10000"
                    />
                  </div>
                </div>
                <div className="mt-1 px-1">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="50000"
                    value={searchParams.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="50000"
                    value={searchParams.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius (km)
                </label>
                <select
                  name="radius"
                  value={searchParams.radius}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={resetFilters}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Panel (Right Side) */}
        <div className="md:col-span-3">
          {/* Results Header */}
          {vehicles.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                  {totalResults} Results Found
                </h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="distance">Distance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getVehicleImage(vehicle.brand, vehicle.model)}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold">
                      {vehicle.type === 'car' ? 'Car' : 'Bike'}
                    </div>
                    {vehicle.distance !== undefined && (
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 text-xs">
                        {vehicle.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h2>
                    <div className="text-sm text-gray-500 mb-2">Year: {vehicle.year}</div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-blue-600 text-lg">₹{vehicle.price.toLocaleString()}</span>
                      <span className="text-sm bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                        {vehicle.specifications?.fuelType || (vehicle.type === 'car' ? 'Petrol' : 'Petrol')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {vehicle.showroom?.name}
                      </div>
                      <div>
                        {vehicle.available ? (
                          <span className="text-green-600">Available</span>
                        ) : (
                          <span className="text-red-600">Sold Out</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/vehicle/${vehicle._id}`}
                      className="block w-full py-2 bg-blue-600 text-center text-white rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error("Please log in or register to compare vehicles.");
                          navigate('/register');
                        } else {
                          toggleComparison(vehicle);
                        }
                      }}
                      className={`block w-full py-2 mt-2 text-center rounded-md transition ${
                        selectedVehicles.some(v => v._id === vehicle._id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {
                        selectedVehicles.some(v => v._id === vehicle._id)
                          ? 'Selected for Compare'
                          : 'Add to Compare'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              {location.search ? (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any vehicles matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Reset Filters
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Search for vehicles</h3>
                  <p className="text-gray-600 mb-4">
                    Use the filters on the left to search for cars and bikes near you. You can filter by type, brand, model, and price range.
                  </p>
                  <button
                    onClick={() => handleSearch()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Search Now
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Compare Button (only show when vehicles are selected) */}
      {selectedVehicles.length === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center shadow-lg items-center">
          <div className="text-lg font-semibold">
            Compare: {selectedVehicles[0].brand} {selectedVehicles[0].model} vs {selectedVehicles[1].brand} {selectedVehicles[1].model}
          </div>
          <Link
            to="/compare"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ml-4"
          >
            Compare Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;
