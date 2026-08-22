// client/src/pages/ShowroomLocator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import showroomService from '../services/showroomService';
import { getUserLocation, getDefaultLocation, getDirectionsUrl, formatAddress } from '../utils/mapUtils';
import toast from 'react-hot-toast';

// Fix for default marker icon in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ShowroomLocator = () => {
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowroom, setSelectedShowroom] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState({
    vehicleType: 'all', // 'all', 'car', 'bike'
    brand: '',
    distance: 25 // in km
  });




  const mapRef = useRef(null);

  const initialize = async (force = false) => {
    if (!force && userLocation) return;

    setLoading(true);
    try {
      const position = await getUserLocation();
      setUserLocation(position);
      fetchShowrooms(position);
      if (mapRef.current) {
        mapRef.current.flyTo([position.lat, position.lng], 13);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not access your location. Using default location.');
      const defaultPosition = getDefaultLocation();
      setUserLocation(defaultPosition);
      fetchShowrooms(defaultPosition);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchShowrooms(userLocation);
    }
  }, [filter]);

  const fetchShowrooms = async (location) => {
    setLoading(true);
    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
        distance: filter.distance,
        ...(filter.vehicleType !== 'all' && { vehicleType: filter.vehicleType }),
        ...(filter.brand && { brand: filter.brand })
      };
      const data = await showroomService.getShowrooms(params);
      setShowrooms(data);
    } catch (error) {
      console.error('Error fetching showrooms:', error);
      toast.error('Failed to load nearby showrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const getShowroomIcon = (showroom) => {
    if (showroom.vehicleTypes.includes('car') && showroom.vehicleTypes.includes('bike')) {
      return <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Cars & Bikes</div>;
    } else if (showroom.vehicleTypes.includes('car')) {
      return <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Cars</div>;
    } else {
      return <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Bikes</div>;
    }
  };
  
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Find Nearby Showrooms</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select name="vehicleType" value={filter.vehicleType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="all">All Types</option>
                  <option value="car">Cars Only</option>
                  <option value="bike">Bikes Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
                <input type="text" name="brand" value={filter.brand} onChange={handleFilterChange} placeholder="Enter brand name" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                <select name="distance" value={filter.distance} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>
              <div>
                <button 
                  onClick={() => initialize(true)} 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Find Nearby
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Nearby Showrooms</h2>
            {loading ? (
              <div className="flex justify-center py-8"><div className="loader"></div></div>
            ) : showrooms.length > 0 ? (
              <TransitionGroup className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {showrooms.map(showroom => (
                  <CSSTransition key={showroom._id} timeout={500} classNames="item">
                    <div 
                      className={`p-4 rounded-lg cursor-pointer border transition-colors ${
                        selectedShowroom && selectedShowroom._id === showroom._id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedShowroom(showroom)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{showroom.name}</h3>
                        {getShowroomIcon(showroom)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{formatAddress(showroom)}</p>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>{showroom.distance.toFixed(1)} km away</span>
                        <span>{showroom.vehicleCount} vehicles</span>
                      </div>
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            ) : (
              <div className="text-center py-8 text-gray-500">No showrooms found in this area with the selected filters.</div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {userLocation ? (
            <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} ref={mapRef} style={{ height: '600px', width: '100%' }}>
              <ChangeView center={[userLocation.lat, userLocation.lng]} zoom={13} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              {showrooms.map(showroom => (
                <Marker
                  key={showroom._id}
                  position={[showroom.location.coordinates[1], showroom.location.coordinates[0]]}
                  eventHandlers={{
                    click: () => {
                      setSelectedShowroom(showroom);
                    },
                  }}
                >
                  <Popup>
                    <b>{showroom.name}</b><br />
                    {formatAddress(showroom)}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="h-[600px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
              <p>Loading Map...</p>
            </div>
          )}
           <CSSTransition
            in={selectedShowroom !== null}
            timeout={300}
            classNames="fade"
            unmountOnExit
          >
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedShowroom?.name}</h2>
                  <p className="text-gray-600 mt-1">{formatAddress(selectedShowroom)}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {selectedShowroom?.distance.toFixed(1)} km away
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShowroom(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p>{selectedShowroom?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p>{selectedShowroom?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hours</p>
                    <p>{selectedShowroom?.hours || '9:00 AM - 7:00 PM'}</p>
                  </div>
                </div>
              </div>
              
              {selectedShowroom?.popularBrands && selectedShowroom?.popularBrands.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Available Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedShowroom?.popularBrands.map((brand, idx) => (
                      <div key={idx} className="bg-gray-100 rounded-md p-2 text-center">
                        {brand}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex space-x-4">
                <a
                  href={getDirectionsUrl(userLocation, selectedShowroom?.location?.coordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition text-center"
                >
                  Get Directions
                </a>
                <Link
                  to={`/showroom/${selectedShowroom?._id}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition text-center"
                >
                  View Showroom
                </Link>
              </div>
            </div>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};

export default ShowroomLocator;
