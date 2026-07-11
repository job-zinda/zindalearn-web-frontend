import React, { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle } from 'lucide-react';

const VideoPlayer = ({ videoUrl, source, thumbnail, title, onTimeUpdate, onEnded, initialTime }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [videoUrl]);

  const handleLoadedMetadata = (e) => {
    const video = e.target;
    if (initialTime && initialTime > 0 && initialTime < video.duration) {
      video.currentTime = Number(initialTime);
    }
  };

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration);
    }
  };

  const handleEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  const renderPlayer = () => {
    if (!videoUrl) {
      return <PlayerError message="No video content provided for this lesson" />;
    }

    if (source === 'youtube') {
      const videoId = getYouTubeId(videoUrl);
      if (!videoId) return <PlayerError message="Invalid YouTube URL" />;
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      );
    }

    if (source === 'vimeo') {
      const videoId = getVimeoId(videoUrl);
      if (!videoId) return <PlayerError message="Invalid Vimeo URL" />;
      
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      );
    }

    // Default to 'upload' (Cloudinary)
    return (
      <video
        key={videoUrl}
        controls
        className="absolute inset-0 w-full h-full object-contain bg-black"
        poster={thumbnail}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedData={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url) => {
    const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  return (
    <div className="relative aspect-video w-full bg-slate-900 rounded-[24px] overflow-hidden shadow-2xl group border border-slate-800">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-slate-300 font-bold text-sm uppercase tracking-widest">Loading Lesson...</p>
        </div>
      )}

      {error ? (
        <PlayerError message="Could not load video" />
      ) : (
        renderPlayer()
      )}
    </div>
  );
};

const PlayerError = ({ message }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
    <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
    <h3 className="text-lg font-bold mb-2">{message}</h3>
    <p className="text-sm text-slate-400">Please try again later or contact support.</p>
  </div>
);

export default VideoPlayer;