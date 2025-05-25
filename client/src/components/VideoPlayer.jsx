import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted = false, autoPlay = true, className = '' }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <video
      ref={videoRef}
      muted={muted}
      autoPlay={autoPlay}
      playsInline
      className={`rounded-lg ${className}`}
    />
  );
};

export default VideoPlayer;
