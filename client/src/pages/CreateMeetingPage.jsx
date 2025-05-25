import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateMeetingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participants, setParticipants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        // Filter out current user
        const filteredUsers = response.data.users.filter(user => user.id !== currentUser.id);
        setAvailableUsers(filteredUsers);
        setFetchingUsers(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [currentUser.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/meetings', {
        subject,
        description,
        startTime,
        endTime,
        participants: selectedUsers
      });
      
      toast.success('Court session scheduled successfully');
      navigate('/meetings');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to schedule court session');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (e) => {
    const userId = parseInt(e.target.value);
    if (userId && !selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  const getUserById = (id) => {
    return availableUsers.find(user => user.id === id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Schedule Court Session</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Case Subject *
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Case Description
              </label>
              <textarea
                id="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participants
              </label>
              
              {fetchingUsers ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                  <span className="text-sm text-gray-500">Loading users...</span>
                </div>
              ) : (
                <>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={handleUserSelect}
                    value=""
                  >
                    <option value="">Select participants</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  
                  {selectedUsers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Participants:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = getUserById(userId);
                          return user ? (
                            <div 
                              key={userId} 
                              className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm"
                            >
                              <span>{user.name}</span>
                              <button 
                                type="button"
                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                                onClick={() => removeUser(userId)}
                              >
                                &times;
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                onClick={() => navigate('/meetings')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Scheduling...</span>
                  </div>
                ) : (
                  'Schedule Session'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
