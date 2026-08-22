import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import toast from 'react-hot-toast';
import { getVehicleImage } from '../utils/vehicleImages';

const VehicleListing = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getAllVehicles(page);
        setVehicles(data.vehicles);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
        });
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">All Vehicles</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getVehicleImage(vehicle.brand, vehicle.model)}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold">
                    {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2 truncate">{vehicle.brand} {vehicle.model}</h2>
                  <div className="text-sm text-gray-500 mb-2">Year: {vehicle.year}</div>
                  <div className="mb-4">
                    <span className="font-semibold text-blue-600 text-xl">₹{vehicle.price.toLocaleString()}</span>
                  </div>
                  <Link
                    to={`/vehicle/${vehicle._id}`}
                    className="block w-full py-2 bg-blue-600 text-center text-white rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No vehicles found in the database.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleListing;
