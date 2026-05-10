import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-slate-900 min-h-screen font-serif text-slate-100">
      {/* Hero Section */}
      <div className="relative bg-slate-950 border-b-2 border-amber-600">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20"
            src="/images/Supreme-Court-of-India (2).jpg"
            alt="Supreme Court"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-900/70" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-700 rounded-full flex items-center justify-center border-4 border-amber-400 mb-6 shadow-2xl">
            <span className="text-4xl font-bold">🏛️</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-widest text-amber-500 uppercase sm:text-6xl lg:text-7xl drop-shadow-md">
            Virtual Court
          </h1>
          <p className="mt-6 text-xl text-slate-300 max-w-3xl leading-relaxed drop-shadow-sm border-t border-b border-slate-700 py-4">
            A secure, professional platform for conducting official virtual court sessions, evidence presentation, and case management with AI-powered stenography.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded shadow-lg text-amber-950 bg-amber-500 hover:bg-amber-400 transition-all duration-300 uppercase tracking-wider"
              >
                Enter Chambers
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-bold rounded shadow-lg text-amber-950 bg-amber-500 hover:bg-amber-400 transition-all duration-300 uppercase tracking-wider"
                >
                  Register Appearance
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-slate-600 text-lg font-bold rounded text-slate-100 bg-slate-800 hover:bg-slate-700 transition-all duration-300 uppercase tracking-wider"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-amber-500 font-bold tracking-widest uppercase">The Court Record</h2>
            <p className="mt-2 text-4xl font-extrabold text-slate-100 sm:text-5xl font-serif">
              A highly formalized legal environment
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative bg-slate-950 p-6 rounded-lg shadow-xl border-t-4 border-amber-600 hover:border-amber-400 transition-all duration-300">
                <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wide">Roles & Order</h3>
                <p className="mt-4 text-base text-slate-400">
                  Dedicated privileges for Judges, Clerks, Lawyers, and Witnesses to maintain courtroom decorum.
                </p>
              </div>

              <div className="relative bg-slate-950 p-6 rounded-lg shadow-xl border-t-4 border-amber-600 hover:border-amber-400 transition-all duration-300">
                <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wide">Evidence Management</h3>
                <p className="mt-4 text-base text-slate-400">
                  Lawyers and Judges can formally present documents to the floor for instant synced viewing.
                </p>
              </div>

              <div className="relative bg-slate-950 p-6 rounded-lg shadow-xl border-t-4 border-amber-600 hover:border-amber-400 transition-all duration-300">
                <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wide">AI Stenography</h3>
                <p className="mt-4 text-base text-slate-400">
                  Automated integration with the Groq API to compile and summarize the official court transcript.
                </p>
              </div>

              <div className="relative bg-slate-950 p-6 rounded-lg shadow-xl border-t-4 border-amber-600 hover:border-amber-400 transition-all duration-300">
                <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wide">Waiting Rooms</h3>
                <p className="mt-4 text-base text-slate-400">
                  Secure lobbies allowing Judges to selectively admit witnesses and plaintiffs to the floor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
