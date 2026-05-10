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
    <div className="min-h-screen bg-slate-900 font-serif text-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/dashboard')} className="mr-4 text-slate-400 hover:text-amber-500 transition-colors">
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-amber-500 uppercase tracking-widest">Schedule Court Session</h1>
        </div>
        
        <div className="bg-slate-950 rounded-xl shadow-2xl border-l-4 border-amber-600 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="subject" className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                Case Subject *
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                Case Description
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startTime" className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all [color-scheme:dark]"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all [color-scheme:dark]"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-8 border-t border-slate-800 pt-6">
              <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                Summon Participants
              </label>
              
              {fetchingUsers ? (
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                  <span className="text-sm">Loading registry...</span>
                </div>
              ) : (
                <>
                  <select
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    onChange={handleUserSelect}
                    value=""
                  >
                    <option value="">Select participants to summon</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  
                  {selectedUsers.length > 0 && (
                    <div className="mt-4 bg-slate-900 p-4 rounded border border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Summoned List:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(userId => {
                          const user = getUserById(userId);
                          return user ? (
                            <div 
                              key={userId} 
                              className="flex items-center bg-slate-800 border border-slate-600 text-slate-200 px-3 py-1 rounded shadow"
                            >
                              <span className="mr-2">{user.name} <span className="text-amber-600 text-xs uppercase">({user.role})</span></span>
                              <button 
                                type="button"
                                className="text-red-500 hover:text-red-400 font-bold ml-1"
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
            
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                className="px-6 py-3 border border-slate-700 rounded font-bold text-slate-300 mr-4 hover:bg-slate-800 uppercase tracking-wider transition-colors"
                onClick={() => navigate('/meetings')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-700 text-white font-bold rounded shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 uppercase tracking-widest transition-all"
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
