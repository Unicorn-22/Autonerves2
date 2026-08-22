// client/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black bg-opacity-60 text-white shadow-none">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">AUTONERVES</Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link to="/search" className="hover:text-blue-400 transition">Search Vehicles</Link>
            <Link to="/vehicles" className="hover:text-blue-400 transition">View All Vehicles</Link>
            <Link to="/showrooms" className="hover:text-blue-400 transition">Showroom Locator</Link>
            <Link to="/compare" className="hover:text-blue-400 transition">Compare Vehicles</Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="font-medium">Welcome, {user?.name}</span>
                {(user?.role === 'dealer' || user?.role === 'admin') && (
                  <Link to="/manage-showroom" className="hover:text-blue-400 transition">My Showroom</Link>
                )}
                <button onClick={handleLogout} className="hover:text-blue-400 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-400 transition">Login</Link>
                <Link 
                  to="/register" 
                  className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 pb-5 bg-black bg-opacity-70 rounded-lg">
            <Link to="/search" className="block hover:text-blue-400 transition">Search Vehicles</Link>
            <Link to="/vehicles" className="block hover:text-blue-400 transition">View All Vehicles</Link>
            <Link to="/showrooms" className="block hover:text-blue-400 transition">Showroom Locator</Link>
            <Link to="/compare" className="block hover:text-blue-400 transition">Compare Vehicles</Link>
            {isAuthenticated ? (
              <div className="space-y-2 pt-2 border-t border-blue-500">
                <span className="block font-medium">Welcome, {user?.name}</span>
                {(user?.role === 'dealer' || user?.role === 'admin') && (
                  <Link to="/manage-showroom" className="block hover:text-blue-400 transition">My Showroom</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left hover:text-blue-400 transition">Logout</button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-blue-500">
                <Link to="/login" className="block hover:text-blue-400 transition">Login</Link>
                <Link 
                  to="/register" 
                  className="block bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition w-full text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
