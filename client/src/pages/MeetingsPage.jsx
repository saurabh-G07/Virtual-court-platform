import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const MeetingsPage = () => {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meetings');
      setMeetings(response.data.meetings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
      setLoading(false);
    }
  };

  const deleteMeeting = async (id) => {
    if (window.confirm('Are you sure you want to delete this court session?')) {
      try {
        await api.delete(`/meetings/${id}`);
        toast.success('Court session deleted successfully');
        fetchMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        toast.error('Failed to delete court session');
      }
    }
  };

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMeetings = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return meetings.filter(meeting => new Date(meeting.startTime) > now);
      case 'past':
        return meetings.filter(meeting => new Date(meeting.endTime) < now);
      default:
        return meetings;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-serif text-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 mr-4">
              <span className="text-2xl text-amber-500">📁</span>
            </div>
            <h1 className="text-3xl font-extrabold text-amber-500 uppercase tracking-widest">Official Docket</h1>
          </div>
          <Link 
            to="/meetings/create" 
            className="px-6 py-3 bg-amber-700 text-white font-bold uppercase tracking-wider rounded hover:bg-amber-600 transition-colors shadow-lg"
          >
            Schedule Hearing
          </Link>
        </div>

        <div className="bg-slate-950 rounded-xl shadow-2xl border-l-4 border-amber-600 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <div className="flex space-x-3">
              <button 
                className={`px-4 py-2 rounded font-bold uppercase tracking-wider text-xs transition-colors ${filter === 'all' ? 'bg-amber-900 text-amber-100 border border-amber-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setFilter('all')}
              >
                All Hearings
              </button>
              <button 
                className={`px-4 py-2 rounded font-bold uppercase tracking-wider text-xs transition-colors ${filter === 'upcoming' ? 'bg-amber-900 text-amber-100 border border-amber-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`px-4 py-2 rounded font-bold uppercase tracking-wider text-xs transition-colors ${filter === 'past' ? 'bg-amber-900 text-amber-100 border border-amber-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setFilter('past')}
              >
                Past Records
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredMeetings().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Case Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Start Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                      End Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Court Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-950 divide-y divide-slate-800">
                  {filteredMeetings().map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-slate-900 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-200">{meeting.subject}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">ID: {meeting.roomId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-400">{formatDate(meeting.startTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-400">{formatDate(meeting.endTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded border ${getStatusClass(meeting.status).replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-')}`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <Link 
                            to={`/room/${meeting.roomId}`}
                            className="text-blue-400 font-bold hover:text-blue-300 uppercase tracking-wider text-xs border border-blue-900 px-2 py-1 rounded"
                          >
                            Enter Room
                          </Link>
                          {meeting.createdBy === currentUser.id && (
                            <button 
                              onClick={() => deleteMeeting(meeting.id)}
                              className="text-red-500 font-bold hover:text-red-400 uppercase tracking-wider text-xs border border-red-900 px-2 py-1 rounded"
                            >
                              Strike
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center">
              <span className="text-4xl mb-4 text-slate-700">⚖️</span>
              <p className="text-lg">No court sessions found in the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
