import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gray-50">
      {/* Hero Section with improved overlay and styling */}
      <div className="relative bg-indigo-900">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover"
            src="/images/Supreme-Court-of-India (2).jpg"
            alt="Supreme Court"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-600/70" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-md">
            Virtual Court
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl leading-relaxed drop-shadow-sm">
            A secure platform for conducting virtual court sessions, legal consultations, and case management with end-to-end encryption and professional tools.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-80 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section with improved layout */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">FEATURES</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              A better way to conduct court proceedings
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform provides all the tools needed for effective virtual court sessions and legal consultations.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">HD Video Conferencing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Conduct court sessions with high-definition video and crystal-clear audio for all participants.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Secure Communications</h3>
                <p className="mt-2 text-base text-gray-500">
                  End-to-end encryption ensures that all communications remain private and confidential.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Smart Scheduling</h3>
                <p className="mt-2 text-base text-gray-500">
                  Easily schedule court sessions and manage your calendar with automated reminders.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Document Sharing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Share and present documents during sessions for effective case management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - New Addition */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              How Virtual Court Works
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold">1</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Schedule a Session</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create a new court session and invite all required participants.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold">2</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Join the Virtual Court</h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect via any device with a camera and microphone at the scheduled time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 text-2xl font-bold">3</div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Conduct Proceedings</h3>
                <p className="mt-2 text-base text-gray-500">
                  Share documents, present evidence, and record the session for future reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Join our platform today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
