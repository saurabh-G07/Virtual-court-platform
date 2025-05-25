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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Court Sessions</h1>
        <Link 
          to="/meetings/create" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Schedule New Session
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${filter === 'upcoming' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${filter === 'past' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100'}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredMeetings().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMeetings().map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{meeting.subject}</div>
                      <div className="text-sm text-gray-500">Room ID: {meeting.roomId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(meeting.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(meeting.endTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(meeting.status)}`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/room/${meeting.roomId}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Join
                        </Link>
                        {meeting.createdBy === currentUser.id && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => deleteMeeting(meeting.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No court sessions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
