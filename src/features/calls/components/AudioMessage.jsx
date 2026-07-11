import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const AudioMessage = ({ url, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 min-w-[200px] py-1`}>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded}
        hidden
      />
      
      <button 
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isMe ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="translate-x-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="relative h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-100 ${isMe ? 'bg-white' : 'bg-purple-600'}`}
            style={{ width: `${(currentTime / (duration || audioRef.current?.duration || 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
            {formatTime(currentTime)}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <Volume2 size={14} className={isMe ? 'text-white/40' : 'text-gray-300'} />
    </div>
  );
};

export default AudioMessage;
