import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import showroomService from "../services/showroomService";
import vehicleService from "../services/vehicleService";
import toast from "react-hot-toast";

const ShowroomManagement = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("showrooms");
  const [selectedShowroom, setSelectedShowroom] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // New showroom form state
  const [showroomForm, setShowroomForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    vehicleTypes: [],
    lat: "",
    lng: "",
    description: "",
  });

  // New vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    type: "car",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    description: "",
    specifications: {
      engine: "",
      transmission: "",
      mileage: "",
      fuelType: "",
      seatingCapacity: "",
      colors: "",
      features: "",
    },
    showroom: "",
  });
  const [vehicleImages, setVehicleImages] = useState(null);

  const handleImageChange = (e) => {
    setVehicleImages(e.target.files);
  };

  // Check if user is authorized
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/manage-showroom" } } });
      return;
    }

    if (user && user.role !== "dealer" && user.role !== "admin") {
      toast.error("Only dealers can access this page");
      navigate("/");
      return;
    }

    // Load dealer showrooms
    const loadShowrooms = async () => {
      try {
        setLoading(true);
        // This would be a custom endpoint in a real app to get showrooms owned by the dealer
        const response = await showroomService.getAllShowrooms();
        // Filter by owner (this would be done on the backend in a real app)
        const filteredShowrooms = response.showrooms.filter(
          (showroom) => showroom.owner && showroom.owner.id === user.id
        );
        setShowrooms(filteredShowrooms);
      } catch (error) {
        console.error("Error loading showrooms:", error);
        toast.error("Failed to load showrooms");
      } finally {
        setLoading(false);
      }
    };

    loadShowrooms();
  }, [isAuthenticated, user, navigate]);

  // Load vehicles for selected showroom
  useEffect(() => {
    if (selectedShowroom) {
      const loadVehicles = async () => {
        try {
          setVehiclesLoading(true);
          const data = await showroomService.getShowroomVehicles(
            selectedShowroom._id
          );
          setVehicles(data.vehicles);
        } catch (error) {
          console.error("Error loading vehicles:", error);
          toast.error("Failed to load vehicles");
        } finally {
          setVehiclesLoading(false);
        }
      };

      loadVehicles();
    }
  }, [selectedShowroom]);

  const handleShowroomFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "vehicleTypes") {
      // Handle checkbox array
      const updatedVehicleTypes = [...showroomForm.vehicleTypes];
      if (checked) {
        updatedVehicleTypes.push(value);
      } else {
        const index = updatedVehicleTypes.indexOf(value);
        if (index > -1) {
          updatedVehicleTypes.splice(index, 1);
        }
      }

      setShowroomForm({
        ...showroomForm,
        vehicleTypes: updatedVehicleTypes,
      });
    } else {
      setShowroomForm({
        ...showroomForm,
        [name]: value,
      });
    }
  };

  const handleVehicleFormChange = (e) => {
    const { name, value } = e.target;

    // Handle nested specifications
    if (name.startsWith("spec_")) {
      const specName = name.replace("spec_", "");
      setVehicleForm({
        ...vehicleForm,
        specifications: {
          ...vehicleForm.specifications,
          [specName]: value,
        },
      });
    } else {
      setVehicleForm({
        ...vehicleForm,
        [name]: value,
      });
    }
  };

  const handleShowroomSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data
      const showroomData = {
        ...showroomForm,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(showroomForm.lng),
            parseFloat(showroomForm.lat),
          ],
        },
      };

      // Remove unnecessary fields
      delete showroomData.lat;
      delete showroomData.lng;

      const newShowroom = await showroomService.createShowroom(showroomData);

      setShowrooms([...showrooms, newShowroom]);
      setShowroomForm({
        name: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        vehicleTypes: [],
        lat: "",
        lng: "",
        description: "",
      });

      toast.success("Showroom created successfully!");
      setActiveTab("showrooms");
    } catch (error) {
      console.error("Error creating showroom:", error);
      toast.error(error.response?.data?.message || "Failed to create showroom");
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Create vehicle with text data
      const processedForm = {
        ...vehicleForm,
        specifications: {
          ...vehicleForm.specifications,
          colors: vehicleForm.specifications.colors.split(",").map((color) => color.trim()),
          features: vehicleForm.specifications.features.split(",").map((feature) => feature.trim()),
        },
        showroom: selectedShowroom._id,
      };

      const newVehicle = await vehicleService.createVehicle(processedForm);

      // Step 2: If there are images, upload them
      if (vehicleImages && vehicleImages.length > 0) {
        const imageFormData = new FormData();
        for (let i = 0; i < vehicleImages.length; i++) {
          imageFormData.append('images', vehicleImages[i]);
        }
        
        const updatedVehicle = await vehicleService.uploadVehicleImages(newVehicle._id, imageFormData);
        setVehicles([updatedVehicle, ...vehicles]);
      } else {
        setVehicles([newVehicle, ...vehicles]);
      }

      // Reset form
      setVehicleForm({
        type: "car",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        price: "",
        description: "",
        specifications: {
          engine: "",
          transmission: "",
          mileage: "",
          fuelType: "",
          seatingCapacity: "",
          colors: "",
          features: "",
        },
        showroom: selectedShowroom._id,
      });
      setVehicleImages(null);
      // This is a bit of a hack to clear the file input visually
      document.querySelector('input[type="file"][name="images"]').value = "";

      toast.success("Vehicle added successfully!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to add vehicle");
    }
  };

  const handleDeleteShowroom = async (showroomId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this showroom? This will also delete all vehicles associated with it."
      )
    ) {
      return;
    }

    try {
      await showroomService.deleteShowroom(showroomId);
      setShowrooms(showrooms.filter((showroom) => showroom._id !== showroomId));

      if (selectedShowroom && selectedShowroom._id === showroomId) {
        setSelectedShowroom(null);
        setVehicles([]);
      }

      toast.success("Showroom deleted successfully");
    } catch (error) {
      console.error("Error deleting showroom:", error);
      toast.error("Failed to delete showroom");
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleId));

      toast.success("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  if (
    !isAuthenticated ||
    (user && user.role !== "dealer" && user.role !== "admin")
  ) {
    return null; // This is handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Showroom Management</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-3 ${
              activeTab === "showrooms"
                ? "bg-blue-50 border-b-2 border-blue-500 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("showrooms")}
          >
            My Showrooms
          </button>
          <button
            className={`px-4 py-3 ${
              activeTab === "add-showroom"
                ? "bg-blue-50 border-b-2 border-blue-500 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("add-showroom")}
          >
            Add New Showroom
          </button>
          {selectedShowroom && (
            <button
              className={`px-4 py-3 ${
                activeTab === "add-vehicle"
                  ? "bg-blue-50 border-b-2 border-blue-500 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("add-vehicle")}
            >
              Add Vehicle to {selectedShowroom.name}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* My Showrooms Tab */}
          {activeTab === "showrooms" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Showrooms</h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : showrooms.length > 0 ? (
                <div className="space-y-4">
                  {showrooms.map((showroom) => (
                    <div key={showroom._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            {showroom.name}
                          </h3>
                          <p className="text-gray-600">
                            {showroom.address}, {showroom.city},{" "}
                            {showroom.state}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {showroom.vehicleTypes.map((type) => (
                              <span
                                key={type}
                                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}s
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedShowroom(showroom);
                              setActiveTab("add-vehicle");
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Add Vehicle
                          </button>
                          <button
                            onClick={() => handleDeleteShowroom(showroom._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedShowroom(showroom)}
                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Manage Vehicles ({showroom.vehicleCount || "0"})
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    You don't have any showrooms yet.
                  </p>
                  <button
                    onClick={() => setActiveTab("add-showroom")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Your First Showroom
                  </button>
                </div>
              )}

              {/* Vehicle Listing for Selected Showroom */}
              {selectedShowroom && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      Vehicles at {selectedShowroom.name}
                    </h3>
                    <button
                      onClick={() => setSelectedShowroom(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>

                  {vehiclesLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : vehicles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vehicle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {vehicles.map((vehicle) => (
                            <tr key={vehicle._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {vehicle.brand} {vehicle.model}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {vehicle.year}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {vehicle.type.charAt(0).toUpperCase() +
                                  vehicle.type.slice(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{vehicle.price.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    vehicle.available
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {vehicle.available ? "Available" : "Sold"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a
                                  href={`/vehicle/${vehicle._id}`}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() =>
                                    handleDeleteVehicle(vehicle._id)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        No vehicles available for this showroom.
                      </p>
                      <button
                        onClick={() => setActiveTab("add-vehicle")}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add Your First Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Showroom Tab */}
          {activeTab === "add-showroom" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add New Showroom</h2>

              <form onSubmit={handleShowroomSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Showroom Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={showroomForm.name}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={showroomForm.email}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone*
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={showroomForm.phone}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Types*
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="vehicleTypes"
                          value="car"
                          checked={showroomForm.vehicleTypes.includes("car")}
                          onChange={handleShowroomFormChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Cars</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="vehicleTypes"
                          value="bike"
                          checked={showroomForm.vehicleTypes.includes("bike")}
                          onChange={handleShowroomFormChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Bikes</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address*
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={showroomForm.address}
                    onChange={handleShowroomFormChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={showroomForm.city}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={showroomForm.state}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude* (e.g., 28.7041)
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={showroomForm.lat}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude* (e.g., 77.1025)
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={showroomForm.lng}
                      onChange={handleShowroomFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={showroomForm.description}
                    onChange={handleShowroomFormChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Create Showroom
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Vehicle Tab */}
          {activeTab === "add-vehicle" && selectedShowroom && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Add Vehicle to {selectedShowroom.name}
              </h2>

              <form onSubmit={handleVehicleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type*
                    </label>
                    <select
                      name="type"
                      value={vehicleForm.type}
                      onChange={handleVehicleFormChange}
                      required
                      // Continuing client/src/pages/ShowroomManagement.jsx
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {selectedShowroom.vehicleTypes.includes("car") && (
                        <option value="car">Car</option>
                      )}
                      {selectedShowroom.vehicleTypes.includes("bike") && (
                        <option value="bike">Bike</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand*
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={vehicleForm.brand}
                      onChange={handleVehicleFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model*
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={vehicleForm.model}
                      onChange={handleVehicleFormChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year*
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleFormChange}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)*
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={vehicleForm.price}
                      onChange={handleVehicleFormChange}
                      required
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (up to 5)
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    onChange={handleImageChange}
                    accept="image/png, image/jpeg, image/gif"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={vehicleForm.description}
                    onChange={handleVehicleFormChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <h3 className="text-lg font-medium mt-6">Specifications</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine
                    </label>
                    <input
                      type="text"
                      name="spec_engine"
                      value={vehicleForm.specifications.engine}
                      onChange={handleVehicleFormChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission
                    </label>
                    <input
                      type="text"
                      name="spec_transmission"
                      value={vehicleForm.specifications.transmission}
                      onChange={handleVehicleFormChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mileage
                    </label>
                    <input
                      type="text"
                      name="spec_mileage"
                      value={vehicleForm.specifications.mileage}
                      onChange={handleVehicleFormChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <input
                      type="text"
                      name="spec_fuelType"
                      value={vehicleForm.specifications.fuelType}
                      onChange={handleVehicleFormChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seating Capacity
                    </label>
                    <input
                      type="number"
                      name="spec_seatingCapacity"
                      value={vehicleForm.specifications.seatingCapacity}
                      onChange={handleVehicleFormChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    name="spec_colors"
                    value={vehicleForm.specifications.colors}
                    onChange={handleVehicleFormChange}
                    placeholder="Red, Blue, Black, White"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    name="spec_features"
                    value={vehicleForm.specifications.features}
                    onChange={handleVehicleFormChange}
                    placeholder="ABS, Power Steering, AC, GPS Navigation"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowroomManagement;
