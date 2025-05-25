import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import api from '../services/api';

const MeetingRoomPage = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef();
  const screenStreamRef = useRef();
  const chatEndRef = useRef();
  
  // Fetch meeting details
  useEffect(() => {
    const fetchMeeting = async () => {
        try {
            console.log('Fetching meeting with roomId:', roomId);
            const response = await api.get(`/meetings/${roomId}`);
            console.log('Meeting data received:', response.data);
            setMeeting(response.data.meeting);
          } catch (error) {
            console.error('Error fetching meeting:', error.response ? error.response.data : error.message);
            setError('Failed to load meeting details');
          } finally {
            setLoading(false);
          }  
    };
    
    fetchMeeting();
  }, [roomId]);
  
  // Setup WebRTC and WebSocket
  useEffect(() => {
    if (loading || error) return;
    
    // Initialize socket connection
    socketRef.current = io(`${process.env.REACT_APP_API_URL}/stream`, {
      withCredentials: true
    });
    
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        
        // Join room
        socketRef.current.emit('join-room', {
          roomId,
          userId: currentUser.id,
          userName: currentUser.name
        });
        
        // Handle new user connection
        socketRef.current.on('user-connected', userData => {
          console.log('New user connected:', userData);
          addPeer(userData.socketId, stream);
        });
        
        // Handle receiving signal
        socketRef.current.on('signal', data => {
          const item = peersRef.current.find(p => p.socketId === data.from);
          if (item) {
            item.peer.signal(data.signal);
          }
        });
        
        // Handle existing users in room
        socketRef.current.on('room-users', users => {
          const peers = [];
          
          users.forEach(user => {
            const peer = createPeer(user.socketId, stream);
            peersRef.current.push({
              socketId: user.socketId,
              userId: user.userId,
              userName: user.userName,
              peer
            });
            peers.push({
              socketId: user.socketId,
              userId: user.userId,
              userName: user.userName,
              peer
            });
          });
          
          setPeers(peers);
        });
        
        // Handle user disconnection
        socketRef.current.on('user-disconnected', userData => {
          console.log('User disconnected:', userData);
          const peerObj = peersRef.current.find(p => p.socketId === userData.socketId);
          
          if (peerObj) {
            peerObj.peer.destroy();
            peersRef.current = peersRef.current.filter(p => p.socketId !== userData.socketId);
            setPeers(prevPeers => prevPeers.filter(p => p.socketId !== userData.socketId));
          }
        });
        
        // Handle chat messages
        socketRef.current.on('chat-message', data => {
          setMessages(prev => [...prev, data]);
          
          // Scroll to bottom of chat
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        });
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera or microphone');
      });
    
    // Cleanup on unmount
    return () => {
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      peersRef.current.forEach(peerObj => {
        peerObj.peer.destroy();
      });
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, currentUser, loading, error]);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Create peer for outgoing connection
  const createPeer = (socketId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });
    
    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        to: socketId,
        signal
      });
    });
    
    return peer;
  };
  
  // Add peer for incoming connection
  const addPeer = (socketId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });
    
    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        to: socketId,
        signal
      });
    });
    
    peer.on('stream', remoteStream => {
      // Add remote stream to UI
      const peerObj = peersRef.current.find(p => p.socketId === socketId);
      if (peerObj) {
        peerObj.stream = remoteStream;
        setPeers(prev => [...prev]);
      }
    });
    
    peersRef.current.push({
      socketId,
      peer
    });
    
    setPeers(prev => [...prev, { socketId, peer }]);
    
    return peer;
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Replace screen share track with camera track
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        
        peersRef.current.forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = streamRef.current;
        }
      }
      
      setIsScreenSharing(false);
    } else {
      try {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace camera track with screen share track
        const screenTrack = screenStream.getVideoTracks()[0];
        
        peersRef.current.forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });
        
        // Show screen share in local video
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = screenStream;
        }
        
        // Handle screen share stop
        screenTrack.onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    }
  };
  
  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    const messageData = {
      roomId,
      message: messageInput,
      sender: {
        userId: currentUser.id,
        userName: currentUser.name
      }
    };
    
    socketRef.current.emit('chat-message', messageData);
    setMessageInput('');
  };
  
  // Leave meeting
  const leaveMeeting = () => {
    navigate('/meetings');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Back to Meetings
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{meeting?.subject || 'Virtual Court Session'}</h1>
          <p className="text-sm text-gray-400">Room ID: {roomId}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-full ${
              isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isVideoEnabled ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18" 
                />
              )}
            </svg>
          </button>
          
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full ${
              isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isAudioEnabled ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                  clipRule="evenodd" 
                />
              )}
            </svg>
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`p-2 rounded-full ${
              isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </button>
          
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            title={isChatOpen ? 'Close chat' : 'Open chat'}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </button>

          <button
            onClick={leaveMeeting}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            title="Leave meeting"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Video grid */}
        <div className={`${isChatOpen ? 'w-3/4' : 'w-full'} bg-black p-4 relative`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                You ({currentUser.name})
              </div>
            </div>

            {/* Remote videos */}
            {peers.map((peer, index) => (
              <div key={index} className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={video => {
                    if (video && peer.stream) {
                      video.srcObject = peer.stream;
                    }
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
                  {peer.userName || 'Participant'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {isChatOpen && (
          <div className="w-1/4 bg-gray-800 flex flex-col border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-bold">Chat</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${
                    msg.sender.userId === currentUser.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div 
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender.userId === currentUser.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {msg.sender.userName} • {new Date().toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded-l px-4 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoomPage;
