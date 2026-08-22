import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import vehicleService from "../services/vehicleService";
import { getVehicleImage } from "../utils/vehicleImages";
// import img from '../../public/images/desktop-wallpaper-machindra-thar-thar-car.jpg'

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        // Fetch some vehicles to display on homepage
        const { vehicles } = await vehicleService.getAllVehicles(1, 6);
        setFeaturedVehicles(vehicles);
      } catch (error) {
        console.error("Error fetching featured vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVehicles();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        // className="bg-gradient-to-r bg-gray-600 to-blue-800 text-white py-10"
       
      >
      
        <div className="container mx-auto px-4 text-center bg-black bg-opacity-50  py-48"  style={{
          backgroundImage: "url('/images/vehicles/thar.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Find Your Perfect Vehicle at the Best Showrooms
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white">
            Discover nearby showrooms with real-time inventory, compare prices,
            and find the best deals on cars and bikes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/search"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-lg transition"
            >
              Search Vehicles
            </Link>
            <Link
              to="/showrooms"
              className="bg-transparent hover:bg-white text-white hover:text-black border-2 border-white font-bold px-6 py-3 rounded-lg transition"
            >
              Find Nearby Showrooms
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose ShowroomFinder?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Locate Nearby Showrooms
              </h3>
              <p className="text-gray-600">
                Find showrooms near your location with real-time distance
                calculation and accurate mapping.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Compare Vehicle Options
              </h3>
              <p className="text-gray-600">
                Compare prices, specifications, and features of different
                vehicles side by side.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Real-Time Inventory
              </h3>
              <p className="text-gray-600">
                Get up-to-date information about vehicle availability at each
                showroom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Vehicles
          </h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getVehicleImage(vehicle.brand, vehicle.model)}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">
                        ₹{vehicle.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-600">Showroom:</span>
                      <span>{vehicle.showroom.name}</span>
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
              <p className="text-gray-600">No featured vehicles available.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/search"
              className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Search Vehicles</h3>
                <p className="text-gray-600">
                  Search for your desired car or bike by brand, model, price
                  range, or location.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  // Continuing client/src/pages/Home.jsx
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Find Showrooms</h3>
                <p className="text-gray-600">
                  Discover showrooms near your location that have the vehicles
                  you're interested in.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Compare & Visit</h3>
                <p className="text-gray-600">
                  Compare options, get directions to the showroom, and find your
                  perfect vehicle!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Find Your Perfect Vehicle?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who found their dream cars and
            bikes using ShowroomFinder.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-lg transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
