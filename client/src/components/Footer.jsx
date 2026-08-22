// client/src/components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">ShowroomFinder</h3>
            <p className="mb-4 text-gray-400">
              Find the perfect vehicle at showrooms near you. Compare prices and
              specifications to make informed decisions.
            </p>
          </div>
          
          {/* Column 2 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white transition">Search Vehicles</Link>
              </li>
              <li>
                <Link to="/showrooms" className="text-gray-400 hover:text-white transition">Find Showrooms</Link>
              </li>
              <li>
                <Link to="/compare" className="text-gray-400 hover:text-white transition">Compare Vehicles</Link>
              </li>
              <li>
                <Link to="/variables" className="text-gray-400 hover:text-white transition">NHTSA Variables</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition">Register</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@showroomfinder.com</li>
              <li>Phone: +91 9876543210</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} ShowroomFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
