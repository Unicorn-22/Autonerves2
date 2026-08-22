import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import showroomService from "../services/showroomService";
import toast from "react-hot-toast";
import { getGoogleMapsUrl } from "../utils/mapUtils";
import { getVehicleImage } from "../utils/vehicleImages";

const ShowroomDetails = () => {
  const { id } = useParams();
  const [showroom, setShowroom] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vehicles");

  useEffect(() => {
    const fetchShowroomData = async () => {
      setLoading(true);
      try {
        const showroomData = await showroomService.getShowroomById(id);
        setShowroom(showroomData);

        const vehiclesData = await showroomService.getShowroomVehicles(id);
        setVehicles(vehiclesData?.vehicles || []);
      } catch (error) {
        console.error("Error fetching showroom details:", error);
        setError("Failed to load showroom details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowroomData();
  }, [id]);

  const handleGetDirections = () => {
    if (showroom?.location?.coordinates) {
      const [lng, lat] = showroom.location.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    } else {
      toast.error("Showroom location information is not available");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !showroom) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-6">{error || "Showroom not found"}</p>
        <Link
          to="/showrooms"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to Showroom Locator
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/showrooms"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Showroom Locator
        </Link>
      </div>

      {/* Showroom Header */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-3xl font-bold mb-2">{showroom.name}</h1>
          <p>
            {showroom.address}, {showroom.city}, {showroom.state}
          </p>
        </div>

        {/* Showroom Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Contact */}
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Contact
              </h3>
              <div className="space-y-2">
                {showroom.phone && <p>📞 {showroom.phone}</p>}
                {showroom.email && <p>📧 {showroom.email}</p>}
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Hours</h3>
              <p>{showroom.hours || "9:00 AM - 7:00 PM"}</p>
            </div>

            {/* Vehicle Types */}
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Types</h3>
              <div className="flex space-x-2">
                {showroom.vehicleTypes?.map((type) => (
                  <span
                    key={type}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {showroom.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700">{showroom.description}</p>
            </div>
          )}

          {/* Popular Brands */}
          {showroom.popularBrands?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Popular Brands</h3>
              <div className="flex flex-wrap gap-2">
                {showroom.popularBrands.map((brand, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleGetDirections}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Get Directions
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 ${
                activeTab === "vehicles"
                  ? "bg-blue-50 border-b-2 border-blue-500 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("vehicles")}
            >
              Available Vehicles ({vehicles.length})
            </button>
            <button
              className={`px-4 py-3 ${
                activeTab === "map"
                  ? "bg-blue-50 border-b-2 border-blue-500 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("map")}
            >
              Location & Map
            </button>
          </div>

          <div className="p-6">
            {/* Vehicles Tab */}
            {activeTab === "vehicles" && (
              <div>
                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="h-48 overflow-hidden">
                          <img
                            src={getVehicleImage(vehicle.brand, vehicle.model)}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold mb-2">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold">
                              ₹{vehicle.price?.toLocaleString() || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between mb-3">
                            <span className="text-gray-600">Year:</span>
                            <span>{vehicle.year || "-"}</span>
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No vehicles are currently available at this showroom.
                    </p>
                    <Link
                      to="/search"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Search All Vehicles
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Map Tab */}
            {activeTab === "map" && (
              <div>
                <div
                  className="bg-gray-100 h-96 rounded-lg mb-4 flex flex-col items-center justify-center"
                  onClick={handleGetDirections}
                >
                  <p className="text-gray-500">
                    {showroom.location?.coordinates
                      ? "Click to open in Google Maps"
                      : "Location not available"}
                  </p>
                  {showroom.location?.coordinates && (
                    <p className="text-sm text-gray-400 mt-2">
                      Lat: {showroom.location.coordinates[1].toFixed(6)}, Lng:{" "}
                      {showroom.location.coordinates[0].toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <p className="text-gray-700 mb-4">
                    {showroom.address}, {showroom.city}, {showroom.state}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call-to-action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center shadow-lg">
        <Link
          to={`/search?showroomId=${showroom._id}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          View All Vehicles at {showroom.name}
        </Link>
      </div>
    </div>
  );
};

export default ShowroomDetails;
