import React from 'react';
import { Mic, X, Send, Square } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

const VoiceRecorder = ({ onSend }) => {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio
  } = useVoiceRecorder();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
      clearAudio();
    }
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-4 bg-red-50 px-6 py-3 rounded-[30px] border border-red-100 animate-pulse w-full">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <span className="text-sm font-bold text-red-600 tracking-wider">Recording {formatTime(recordingTime)}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={cancelRecording}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <X size={20} />
          </button>
          <button 
            onClick={stopRecording}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
          >
            <Square size={16} fill="white" />
          </button>
        </div>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className="flex items-center gap-4 bg-purple-50 px-6 py-3 rounded-[30px] border border-purple-100 w-full animate-in slide-in-from-bottom-2">
        <span className="text-sm font-bold text-purple-600 flex-1">Voice Message ({formatTime(recordingTime)})</span>
        <div className="flex gap-2">
          <button 
            onClick={clearAudio}
            className="p-2 text-gray-400 hover:text-purple-600"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleSend}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-md shadow-purple-200"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={startRecording}
      className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200"
      title="Record Voice Message"
    >
      <Mic size={20} />
    </button>
  );
};

export default VoiceRecorder;
