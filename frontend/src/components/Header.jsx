import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaShoppingBag, FaComments, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const isLoggedIn = !!user;
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FaShoppingBag size={24} />
            <span className="text-xl font-bold">Campus Connect</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/browse"
              className="hover:text-indigo-200 transition-colors"
            >
              Explore 
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-listing"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Sell Item
                </Link>
                <Link
                  to="/messages"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Messages
                </Link>
              </>
            ) : null}
          </nav>
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 hover:text-indigo-200 transition-colors"
                >
                  <FaUser size={20} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-indigo-200 transition-colors"
                >
                  <FaSignOutAlt size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Link
              to="/browse"
              className="block py-2 hover:text-indigo-200 transition-colors"
            >
              Browse
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-listing"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Sell Item
                </Link>
                <Link
                  to="/messages"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 hover:text-indigo-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 hover:text-indigo-200 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 