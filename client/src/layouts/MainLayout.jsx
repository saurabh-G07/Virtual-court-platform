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
    <div className="min-h-screen bg-slate-900 font-serif flex flex-col text-slate-100">
      {/* Header/Navigation */}
      <header className="bg-slate-950 border-b-4 border-amber-600 text-amber-500 shadow-2xl relative z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-amber-700 rounded-full flex items-center justify-center border-2 border-amber-400 text-xl shadow-lg">
                ⚖️
              </div>
              <span className="text-2xl font-bold uppercase tracking-widest">Virtual Court</span>
            </Link>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md focus:outline-none text-amber-500 hover:text-amber-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 font-bold uppercase tracking-wider text-sm">
              <Link to="/" className="hover:text-amber-300 transition-colors">
                Court Record
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:text-amber-300 transition-colors">
                    Chambers
                  </Link>
                  <Link to="/meetings" className="hover:text-amber-300 transition-colors">
                    Official Docket
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 hover:text-amber-300 transition-colors focus:outline-none">
                      <span className="text-amber-600">{currentUser?.name}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-amber-600/30 rounded shadow-2xl py-1 z-10 hidden group-hover:block">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-amber-500 transition-colors"
                      >
                        Profile & Records
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-amber-500 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:text-amber-300 transition-colors border-b border-transparent hover:border-amber-300 pb-1"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-amber-600 text-amber-950 px-5 py-2 rounded font-extrabold hover:bg-amber-500 transition-all shadow-lg"
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
          <div className="md:hidden bg-slate-950 border-b border-amber-600 py-2 font-bold uppercase tracking-wider text-sm shadow-xl absolute w-full">
            <div className="container mx-auto px-4 flex flex-col space-y-2">
              <Link 
                to="/" 
                className="block py-3 text-amber-500 hover:bg-slate-900 px-3 rounded transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Court Record
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block py-3 text-amber-500 hover:bg-slate-900 px-3 rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Chambers
                  </Link>
                  <Link 
                    to="/meetings" 
                    className="block py-3 text-amber-500 hover:bg-slate-900 px-3 rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Official Docket
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block py-3 text-amber-500 hover:bg-slate-900 px-3 rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile & Records
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 text-red-400 hover:bg-slate-900 px-3 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-3 text-amber-500 hover:bg-slate-900 px-3 rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-3 text-amber-950 bg-amber-600 hover:bg-amber-500 px-3 rounded transition-colors text-center shadow"
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
      <footer className="bg-slate-950 text-slate-400 py-8 border-t-2 border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
              <span className="text-amber-700">⚖️</span>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                &copy; {new Date().getFullYear()} Virtual Court Platform. Official Record.
              </p>
            </div>
            <div className="flex space-x-6 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-amber-500 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-amber-500 transition-colors">
                Contact Clerk
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
