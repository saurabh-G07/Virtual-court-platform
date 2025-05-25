import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await api.get('/meetings');
        
        // Filter for upcoming meetings
        const now = new Date();
        const upcoming = response.data.meetings
          .filter(meeting => new Date(meeting.startTime) > now)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 5); // Get only the next 5 meetings
        
        setUpcomingMeetings(upcoming);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load upcoming meetings');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {currentUser?.name}</h1>
        <p className="text-gray-600">
          This is your Virtual Court dashboard. Here you can manage your court sessions, view upcoming meetings, and access your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/meetings/create" 
              className="block w-full py-2 px-4 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 transition-colors"
            >
              Schedule New Session
            </Link>
            <Link 
              to="/meetings" 
              className="block w-full py-2 px-4 bg-gray-200 text-gray-800 text-center rounded-md hover:bg-gray-300 transition-colors"
            >
              View All Sessions
            </Link>
            <Link 
              to="/profile" 
              className="block w-full py-2 px-4 bg-gray-200 text-gray-800 text-center rounded-md hover:bg-gray-300 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Upcoming Court Sessions</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingMeetings.map((meeting) => (
                    <tr key={meeting.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{meeting.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(meeting.startTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/room/${meeting.roomId}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Join
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming court sessions. 
              <Link to="/meetings/create" className="text-indigo-600 ml-1">
                Schedule one now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
