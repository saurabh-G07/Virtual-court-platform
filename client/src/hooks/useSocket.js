import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (url) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(url);
    
    socket.on('connect', () => {
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [url]);
  
  return { socket: socketRef.current, connected };
};

export default useSocket;
