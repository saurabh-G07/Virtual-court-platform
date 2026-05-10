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
    <div className="min-h-screen bg-slate-900 font-serif text-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950 rounded-xl shadow-2xl border-l-4 border-amber-600 p-8 mb-8 flex items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 mr-6">
            <span className="text-3xl text-amber-500">🏛️</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-amber-500 uppercase tracking-widest mb-2">Chambers of {currentUser?.name}</h1>
            <p className="text-slate-400">
              Welcome to your Virtual Court Dashboard. Manage official sessions, view upcoming hearings, and review case records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-slate-950 rounded-xl shadow-2xl border border-slate-800 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Clerk Actions</h2>
            <div className="space-y-4 flex-1">
              <Link 
                to="/meetings/create" 
                className="block w-full py-3 px-4 bg-amber-700 text-white font-bold uppercase tracking-wider text-center rounded hover:bg-amber-600 transition-colors shadow-lg"
              >
                Schedule Hearing
              </Link>
              <Link 
                to="/meetings" 
                className="block w-full py-3 px-4 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-center rounded border border-slate-700 hover:bg-slate-700 transition-colors shadow"
              >
                View Docket
              </Link>
              <Link 
                to="/profile" 
                className="block w-full py-3 px-4 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-center rounded border border-slate-700 hover:bg-slate-700 transition-colors shadow"
              >
                Modify Records
              </Link>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-slate-950 rounded-xl shadow-2xl border border-slate-800 p-6 md:col-span-2 flex flex-col">
            <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Official Docket</h2>
            
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="overflow-x-auto flex-1 border border-slate-800 rounded">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                        Case Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                        Scheduled Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-950 divide-y divide-slate-800">
                    {upcomingMeetings.map((meeting) => (
                      <tr key={meeting.id} className="hover:bg-slate-900 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-200">{meeting.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">{formatDate(meeting.startTime)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/room/${meeting.roomId}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-900 text-blue-100 font-bold rounded border border-blue-700 hover:bg-blue-800 transition-colors"
                          >
                            Enter Court
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500">
                <span className="text-5xl mb-4 text-slate-700">⚖️</span>
                <p className="text-lg">No hearings scheduled on the docket.</p>
                <Link to="/meetings/create" className="text-amber-600 mt-2 font-bold hover:underline uppercase tracking-wide text-sm">
                  Schedule Hearing Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
