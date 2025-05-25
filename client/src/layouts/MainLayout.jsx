import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/images/logo.jpg" 
                alt="Virtual Court Logo" 
                className="h-10 w-10 rounded-full"
              />
              <span className="text-xl font-bold">Virtual Court</span>
            </Link>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-indigo-200 transition-colors">
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/meetings" className="hover:text-indigo-200 transition-colors">
                    My Meetings
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-1 hover:text-indigo-200 transition-colors">
                      <span>{currentUser?.name}</span>
                      <svg 
                        className="h-4 w-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:text-indigo-200 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-indigo-700 py-2">
            <div className="container mx-auto px-4 flex flex-col space-y-2">
              <Link 
                to="/" 
                className="block py-2 hover:bg-indigo-800 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block py-2 hover:bg-indigo-800 px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/meetings" 
                    className="block py-2 hover:bg-indigo-800 px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Meetings
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block py-2 hover:bg-indigo-800 px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:bg-indigo-800 px-2 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-2 hover:bg-indigo-800 px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-2 hover:bg-indigo-800 px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Virtual Court. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
