import { useState, useEffect } from 'react';

const useMediaStream = (constraints = { video: true, audio: true }) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const getMediaStream = async () => {
      try {
        setLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (mounted) {
          setStream(mediaStream);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setStream(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    getMediaStream();
    
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return { stream, error, loading };
};

export default useMediaStream;
