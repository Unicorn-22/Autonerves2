// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import VehicleSearch from './pages/VehicleSearch';
import ShowroomLocator from './pages/ShowroomLocator';
import VehicleComparison from './pages/VehicleComparison';
import ShowroomManagement from './pages/ShowroomManagement';
import VehicleDetails from './pages/VehicleDetails';
import ShowroomDetails from './pages/ShowroomDetails';
import VehicleListing from './pages/VehicleListing';
import NhtsaVariables from './pages/NhtsaVariables';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import { ComparisonProvider } from './contexts/ComparisonContext';

function App() {
  return (
    <AuthProvider>
      <ComparisonProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="register" element={<Registration />} />
              <Route path="login" element={<Login />} />
              <Route path="search" element={<VehicleSearch />} />
              <Route path="vehicles" element={<VehicleListing />} />
              <Route path="variables" element={<NhtsaVariables />} />
              <Route path="showrooms" element={<ShowroomLocator />} />
              <Route
                path="compare"
                element={
                  <ProtectedRoute redirectTo="/register">
                    <VehicleComparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manage-showroom"
                element={
                  <ProtectedRoute requiredRole="dealer">
                    <ShowroomManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="vehicle/:id" element={<VehicleDetails />} />
              <Route path="showroom/:id" element={<ShowroomDetails />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </ComparisonProvider>
    </AuthProvider>
  );
}

export default App;
