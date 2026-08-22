import React from 'react';
import { useComparison } from '../contexts/ComparisonContext';
import { Link } from 'react-router-dom';
import { getVehicleImage } from '../utils/vehicleImages';

const VehicleComparison = () => {
  const { selectedVehicles, clearComparison } = useComparison();

  const renderComparisonRow = (label, key, vehicle1, vehicle2) => {
    const value1 = vehicle1.specifications?.[key] || vehicle1[key] || 'N/A';
    const value2 = vehicle2.specifications?.[key] || vehicle2[key] || 'N/A';

    const displayValue = (val) => {
      if (Array.isArray(val)) {
        return val.join(', ');
      }
      return val;
    };

    return (
      <tr key={label} className="border-b">
        <td className="py-3 px-4 font-semibold text-gray-700">{label}</td>
        <td className="py-3 px-4">{displayValue(value1)}</td>
        <td className="py-3 px-4">{displayValue(value2)}</td>
      </tr>
    );
  };

  if (selectedVehicles.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Vehicle Comparison</h1>
        <div className="bg-white p-16 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select Two Vehicles to Compare</h2>
          <p className="text-gray-500 mb-6">Go to the search page to select vehicles you want to compare side-by-side.</p>
          <Link to="/search" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
            Go to Vehicle Search
          </Link>
        </div>
      </div>
    );
  }

  const [vehicle1, vehicle2] = selectedVehicles;

  const specKeys = [
    { label: 'Year', key: 'year' },
    { label: 'Engine', key: 'engine' },
    { label: 'Transmission', key: 'transmission' },
    { label: 'Mileage', key: 'mileage' },
    { label: 'Fuel Type', key: 'fuelType' },
    { label: 'Seating Capacity', key: 'seatingCapacity' },
    { label: 'Available Colors', key: 'colors' },
    { label: 'Key Features', key: 'features' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicle Comparison</h1>
        <button
          onClick={clearComparison}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Clear Comparison
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-4 px-4 w-1/4">Feature</th>
              <th className="py-4 px-4">
                <h2 className="text-xl font-bold">{vehicle1.brand} {vehicle1.model}</h2>
                <img src={getVehicleImage(vehicle1.brand, vehicle1.model)} alt={`${vehicle1.brand} ${vehicle1.model}`} className="w-full h-40 object-cover rounded-md mt-2" />
              </th>
              <th className="py-4 px-4">
                <h2 className="text-xl font-bold">{vehicle2.brand} {vehicle2.model}</h2>
                <img src={getVehicleImage(vehicle2.brand, vehicle2.model)} alt={`${vehicle2.brand} ${vehicle2.model}`} className="w-full h-40 object-cover rounded-md mt-2" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-blue-50">
              <td className="py-3 px-4 font-semibold text-blue-800">Price</td>
              <td className="py-3 px-4 text-xl font-bold text-blue-700">₹{vehicle1.price.toLocaleString()}</td>
              <td className="py-3 px-4 text-xl font-bold text-blue-700">₹{vehicle2.price.toLocaleString()}</td>
            </tr>
            {specKeys.map(spec => renderComparisonRow(spec.label, spec.key, vehicle1, vehicle2))}
          </tbody>
        </table>
      </div>
       <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Price Difference</h2>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">₹{Math.abs(vehicle1.price - vehicle2.price).toLocaleString()}</div>
          </div>
        </div>
    </div>
  );
};

export default VehicleComparison;