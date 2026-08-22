// client/src/contexts/ComparisonContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => useContext(ComparisonContext);

export const ComparisonProvider = ({ children }) => {
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const toggleComparison = (vehicle) => {
    setSelectedVehicles(prevSelected => {
      const isSelected = prevSelected.some(v => v._id === vehicle._id);
      if (isSelected) {
        return prevSelected.filter(v => v._id !== vehicle._id);
      } else {
        if (prevSelected.length < 2) {
          return [...prevSelected, vehicle];
        } else {
          // Replace the last added vehicle
          return [prevSelected[1], vehicle];
        }
      }
    });
  };

  const clearComparison = () => {
    setSelectedVehicles([]);
  };

  return (
    <ComparisonContext.Provider value={{ selectedVehicles, toggleComparison, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  );
};
