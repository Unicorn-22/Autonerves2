import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NhtsaVariables = () => {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedVariables, setGroupedVariables] = useState({});

  useEffect(() => {
    const fetchVariables = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/getvehiclevariablelist?format=json');
        const results = response.data.Results;
        setVariables(results);

        // Group variables by GroupName
        const groups = results.reduce((acc, variable) => {
          const groupName = variable.GroupName || 'Uncategorized';
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(variable);
          return acc;
        }, {});
        setGroupedVariables(groups);

      } catch (error) {
        console.error("Error fetching NHTSA variables:", error);
        toast.error("Failed to load vehicle variable list.");
      } finally {
        setLoading(false);
      }
    };

    fetchVariables();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">NHTSA Vehicle Variables</h1>
      <p className="text-center text-gray-600 mb-12">
        This is a list of vehicle variables provided by the National Highway Traffic Safety Administration (NHTSA) API.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedVariables).sort().map(groupName => (
            <div key={groupName} className="bg-white shadow-md rounded-lg overflow-hidden">
              <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">{groupName}</h2>
              <ul className="divide-y divide-gray-200">
                {groupedVariables[groupName].map(variable => (
                  <li key={variable.ID} className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{variable.Name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{variable.DataType}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm" dangerouslySetInnerHTML={{ __html: variable.Description }}></p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NhtsaVariables;
