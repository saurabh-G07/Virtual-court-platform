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
  
  // New States
  const [presentedEvidence, setPresentedEvidence] = useState(null);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  
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
        
        // Join room logic
        if (currentUser.role === 'judge' || currentUser.role === 'clerk') {
          socketRef.current.emit('join-room', {
            roomId,
            userId: currentUser.id,
            userName: currentUser.name,
            role: currentUser.role
          });
          setIsAdmitted(true);
        } else {
          socketRef.current.emit('request-join', {
            roomId,
            userId: currentUser.id,
            userName: currentUser.name,
            role: currentUser.role
          });
        }
        
        // Handle being admitted
        socketRef.current.on('admitted', () => {
          setIsAdmitted(true);
          socketRef.current.emit('join-room', {
            roomId,
            userId: currentUser.id,
            userName: currentUser.name,
            role: currentUser.role
          });
          toast.success('You have been admitted to the courtroom');
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

        // Handle evidence
        socketRef.current.on('evidence-presented', data => {
          setPresentedEvidence(data);
          toast.success('New evidence presented');
        });

        // Handle join requests (for Judge/Clerk)
        socketRef.current.on('join-request', data => {
          setJoinRequests(prev => [...prev, data]);
          toast.success(`${data.userName} (${data.role}) requested to join`);
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
  
  // Handle Evidence Upload
  const handleEvidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('meetingId', meeting.id);
    
    try {
      const res = await api.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const evidence = res.data.evidence;
      socketRef.current.emit('present-evidence', { roomId, evidence });
      setPresentedEvidence(evidence);
      toast.success('Evidence presented to the court');
    } catch (err) {
      toast.error('Evidence upload failed');
    }
  };

  // Admit user
  const admitUser = (request) => {
    socketRef.current.emit('admit-user', { socketId: request.socketId });
    setJoinRequests(prev => prev.filter(r => r.socketId !== request.socketId));
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

  if (!isAdmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-serif">
        <h2 className="text-3xl font-bold mb-4 text-amber-500">🏛️ Virtual Waiting Room</h2>
        <p className="mb-6 text-xl text-center max-w-lg">Please wait until the Honorable Judge or the Court Clerk admits you to the hearing for case <strong>{meeting?.subject}</strong>.</p>
        <div className="animate-pulse w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-2xl border-2 border-amber-500">⏳</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-serif">
      {/* Header - Formal Branding */}
      <header className="bg-slate-950 border-b-2 border-amber-500 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center border-2 border-amber-300">
            <span className="text-xl font-bold">🏛️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-50 tracking-wide uppercase">{meeting?.subject || 'Virtual Court Session'}</h1>
            <p className="text-sm text-slate-400">Case ID: {roomId} | Hon. Presiding</p>
          </div>
        </div>
        <div className="flex space-x-4">
          {/* Controls */}
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded font-semibold border ${
              isVideoEnabled ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-red-900 border-red-700 text-red-100'
            } transition-all`}
          >
            {isVideoEnabled ? '🎥 Video On' : '🚫 Video Off'}
          </button>
          
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded font-semibold border ${
              isAudioEnabled ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-red-900 border-red-700 text-red-100'
            } transition-all`}
          >
            {isAudioEnabled ? '🎙️ Mic On' : '🔇 Muted'}
          </button>

          {/* Present Evidence Button */}
          {['judge', 'lawyer', 'clerk'].includes(currentUser.role) && (
            <label className="cursor-pointer px-4 py-2 rounded font-semibold bg-green-900 border border-green-700 hover:bg-green-800 transition-all text-green-50">
              📄 Present Evidence
              <input type="file" className="hidden" onChange={handleEvidenceUpload} />
            </label>
          )}
          
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="px-4 py-2 rounded font-semibold bg-blue-900 border border-blue-700 hover:bg-blue-800 transition-all text-blue-50"
          >
            💬 Chat
          </button>

          <button
            onClick={leaveMeeting}
            className="px-4 py-2 rounded font-bold bg-red-700 border border-red-500 hover:bg-red-600 transition-all text-white shadow-lg"
          >
            Leave Court
          </button>
        </div>
      </header>

      {/* Main content - Courtroom Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Courtroom View */}
        <div className={`${isChatOpen ? 'w-3/4' : 'w-full'} bg-slate-900 p-6 relative flex flex-col`}>
          
          {/* JUDGE'S BENCH (Top Center) */}
          <div className="flex justify-center mb-8 h-1/3">
            <div className="relative bg-slate-950 rounded-xl overflow-hidden border-4 border-amber-600 shadow-2xl w-1/3 min-w-[300px]">
               {currentUser.role === 'judge' ? (
                 <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
               ) : (
                 <video 
                   autoPlay playsInline className="w-full h-full object-cover" 
                   ref={video => {
                     const judgePeer = peers.find(p => p.role === 'judge');
                     if (video && judgePeer?.stream) video.srcObject = judgePeer.stream;
                   }} 
                 />
               )}
               <div className="absolute bottom-0 w-full bg-slate-950 bg-opacity-90 py-2 text-center border-t border-amber-600">
                 <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">
                   Hon. Judge {currentUser.role === 'judge' ? currentUser.name : (peers.find(p => p.role === 'judge')?.userName || 'Not Present')}
                 </span>
               </div>
            </div>
          </div>

          {/* LOWER COURT (Sides: Lawyers, Center: Witness/Evidence) */}
          <div className="flex-1 flex justify-between gap-6 h-2/3">
            
            {/* DEFENSE / PROSECUTION LEFT */}
            <div className="w-1/4 flex flex-col gap-4">
              {peers.filter(p => p.role === 'lawyer').slice(0, 2).map((peer, i) => (
                <div key={`left-${i}`} className="flex-1 relative bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg">
                  <video autoPlay playsInline className="w-full h-full object-cover" ref={v => { if (v && peer.stream) v.srcObject = peer.stream; }} />
                  <div className="absolute bottom-0 w-full bg-slate-900 py-1 text-center border-t border-slate-700">
                    <span className="text-slate-300 font-semibold text-xs uppercase">{peer.userName} (Counsel)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* WITNESS STAND / EVIDENCE DISPLAY CENTER */}
            <div className="w-1/2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-4 left-4 text-slate-500 uppercase tracking-widest text-xs font-bold z-10">Witness Stand / Evidence</div>
                
                {presentedEvidence ? (
                  <div className="w-full h-full flex flex-col bg-slate-900">
                    <div className="bg-amber-900 text-amber-100 p-2 text-center text-sm font-bold truncate z-10 border-b border-amber-700">
                      Exhibit: {presentedEvidence.title}
                    </div>
                    {presentedEvidence.fileType && presentedEvidence.fileType.startsWith('image/') ? (
                      <img src={`http://localhost:8000${presentedEvidence.fileUrl}?token=${localStorage.getItem('token')}`} className="flex-1 object-contain p-2" alt="Evidence" />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="text-6xl mb-4">📄</span>
                        <a href={`http://localhost:8000${presentedEvidence.fileUrl}?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="text-amber-500 underline text-lg font-bold">
                          View Document
                        </a>
                      </div>
                    )}
                    <button onClick={() => setPresentedEvidence(null)} className="absolute top-2 right-2 bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow z-20">Close</button>
                  </div>
                ) : peers.some(p => p.role === 'witness') ? (
                  <video 
                    autoPlay playsInline className="w-full h-full object-contain" 
                    ref={video => {
                      const witness = peers.find(p => p.role === 'witness');
                      if (video && witness?.stream) video.srcObject = witness.stream;
                    }} 
                  />
                ) : currentUser.role === 'witness' ? (
                  <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <span className="text-4xl mb-4">⚖️</span>
                    <p>No witness on stand</p>
                  </div>
                )}
            </div>

            {/* OTHERS / GALLERY RIGHT */}
            <div className="w-1/4 flex flex-col gap-4">
              {/* Local user if not judge/witness */}
              {['client', 'lawyer', 'clerk', 'admin'].includes(currentUser.role) && (
                <div className="flex-1 relative bg-slate-800 rounded-lg overflow-hidden border-2 border-blue-900 shadow-lg">
                  <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 w-full bg-slate-900 py-1 text-center border-t border-blue-800">
                    <span className="text-blue-300 font-semibold text-xs uppercase">You ({currentUser.role})</span>
                  </div>
                </div>
              )}
              {/* Other peers */}
              {peers.filter(p => !['judge', 'witness'].includes(p.role) && peers.indexOf(p) > 1).map((peer, i) => (
                <div key={`right-${i}`} className="flex-1 relative bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg">
                  <video autoPlay playsInline className="w-full h-full object-cover" ref={v => { if (v && peer.stream) v.srcObject = peer.stream; }} />
                  <div className="absolute bottom-0 w-full bg-slate-900 py-1 text-center border-t border-slate-700">
                    <span className="text-slate-300 font-semibold text-xs uppercase">{peer.userName}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Chat / Transcript panel */}
        {isChatOpen && (
          <div className="w-1/4 bg-slate-950 flex flex-col border-l border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-amber-500 font-bold uppercase tracking-wider">Court Record</h2>
            </div>
            
            {/* Join Requests for Judge/Clerk */}
            {['judge', 'clerk'].includes(currentUser.role) && joinRequests.length > 0 && (
              <div className="p-3 bg-blue-900 border-b border-blue-700">
                <h3 className="text-blue-100 text-xs font-bold mb-2 uppercase">Waiting Room ({joinRequests.length})</h3>
                {joinRequests.map((req, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-800 p-2 rounded mb-1 shadow">
                    <span className="text-sm truncate mr-2">{req.userName} ({req.role})</span>
                    <button onClick={() => admitUser(req)} className="bg-green-700 hover:bg-green-600 text-white text-xs px-2 py-1 rounded">Admit</button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
              {messages.map((msg, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-xs text-amber-600 font-bold mb-1">
                    {msg.sender.userName} <span className="text-slate-500 font-normal">({new Date(msg.timestamp || Date.now()).toLocaleTimeString()})</span>
                  </span>
                  <div className="text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Enter statement for the record..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:border-amber-500 font-sans"
                />
                <button
                  type="submit"
                  className="bg-amber-700 text-white font-bold px-4 py-2 rounded hover:bg-amber-600 transition-colors shadow"
                >
                  Submit
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
