import React, { useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useCall } from '../context/CallContext';

const CallModal = () => {
  const { 
    isCalling, 
    isRinging,
    isConnected, 
    partnerName, 
    partnerAvatar, 
    duration, 
    isMuted, 
    toggleMute, 
    endCall,
    callType,
    localStream,
    remoteStream,
    isCameraOn,
    toggleCamera
  } = useCall();

  const isVideoMode = callType === 'video';

  // Reliable callback refs for stream attachment to dynamically rendered/unmounted elements
  const localVideoRef = useCallback((node) => {
    if (node) {
      node.srcObject = localStream || null;
    }
  }, [localStream]);

  const remoteVideoRef = useCallback((node) => {
    if (node) {
      node.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  if (!isCalling && !isConnected) return null;

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Video Call - Dialing/Waiting State (Before Accept: Premium Large Popup)
  if (isVideoMode && !isConnected) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
        <div className="relative w-full h-full md:max-w-[560px] md:h-[760px] bg-gradient-to-b from-[#1c1c21] to-[#0a0a0f] rounded-none md:rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-8 md:p-12 animate-in zoom-in-95 duration-300">
          
          {/* Background Blurred Avatar + Immersive Gradient */}
          <div className="absolute inset-0 z-0 bg-[#0c0c0f]">
            {partnerAvatar ? (
              <img 
                src={partnerAvatar} 
                alt="background" 
                className="w-full h-full object-cover filter blur-3xl opacity-20 scale-150"
              />
            ) : (
              <div className="w-full h-full bg-[#1c1c21] filter blur-3xl opacity-[0.08]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0c0c0f]/80 to-black z-10" />
          </div>

          {/* Top Header Information Overlay */}
          <div className="relative z-20 text-center mt-6">
            <p className="text-cyan-400 font-bold uppercase tracking-[0.25em] text-[10px] mb-2 animate-pulse">
              Outgoing Video Call
            </p>
            <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{partnerName}</h3>
            <p className="text-white/40 text-xs font-semibold">
              {isRinging ? 'Ringing...' : 'Calling...'}
            </p>
          </div>

          {/* Immersive Pulse Rings + Avatar */}
          <div className="relative z-20 flex justify-center items-center my-auto">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-cyan-500/5 blur-xs animate-ping duration-[3000ms]"></div>
              <div className="absolute w-36 h-36 rounded-full bg-cyan-500/10 blur-xs animate-pulse duration-[2000ms]"></div>
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/15 blur-xs animate-pulse duration-[1000ms]"></div>
              
              <img 
                src={partnerAvatar || `https://ui-avatars.com/api/?name=${partnerName}&background=random`} 
                alt={partnerName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white/10 relative z-10 shadow-2xl"
              />
            </div>
          </div>

          {/* Floating Local Camera Preview */}
          <div className="absolute bottom-28 right-6 md:bottom-32 md:right-10 w-28 h-40 md:w-32 md:h-48 bg-zinc-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20 backdrop-blur-md transition-all duration-300">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover scale-x-[-1] ${isCameraOn && localStream ? 'block' : 'hidden'}`}
            />
            {(!isCameraOn || !localStream) && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/40 text-white/30 gap-1.5 p-2">
                <VideoOff size={20} />
                <span className="text-[8px] uppercase tracking-wider font-bold">Camera Off</span>
              </div>
            )}
          </div>

          {/* Spacious Controls Action Bar */}
          <div className="relative z-20 flex items-center justify-center gap-6 mb-4 md:mb-6">
            <button 
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isMuted 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button 
              onClick={endCall}
              className="p-5 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all transform hover:scale-110 active:scale-90 border border-red-400/25"
              title="Hang Up"
            >
              <PhoneOff size={28} />
            </button>

            <button 
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                !isCameraOn 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
              title={isCameraOn ? "Camera Off" : "Camera On"}
            >
              {isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. Video Call - Connected State (Larger Frame Modal / Responsive)
  if (isVideoMode && isConnected) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-6 animate-in fade-in duration-300">
        <div className="relative w-full h-full md:max-w-[1000px] md:h-[700px] bg-black rounded-none md:rounded-[36px] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          
          {/* Main Area: Remote Video Stream */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover z-0 ${remoteStream ? 'block' : 'hidden'}`}
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-0">
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-xl animate-pulse"></div>
                <img 
                  src={partnerAvatar || `https://ui-avatars.com/api/?name=${partnerName}&background=random`} 
                  alt={partnerName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/10 relative z-10"
                />
              </div>
              <p className="text-white/60 font-medium text-sm animate-pulse">Connecting video feed...</p>
            </div>
          )}

          {/* Local Video Preview (Picture in Picture) */}
          <div className="absolute bottom-24 right-4 md:bottom-8 md:right-8 w-32 h-44 md:w-44 md:h-56 bg-zinc-900 border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl z-20 transition-all duration-300">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover scale-x-[-1] ${isCameraOn && localStream ? 'block' : 'hidden'}`}
            />
            {(!isCameraOn || !localStream) && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/40 gap-2">
                <VideoOff size={24} />
                <span className="text-[9px] uppercase tracking-wider font-bold">Camera Off</span>
              </div>
            )}
          </div>

          {/* Top Header Overlay */}
          <div className="absolute top-6 left-6 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
            <span className="text-xs font-black tracking-tight text-white">{partnerName}</span>
            <span className="text-[10px] font-bold text-cyan-400 border-l border-white/20 pl-3">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/10 z-30">
            <button 
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all duration-300 ${
                isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all duration-300 ${
                !isCameraOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button 
              onClick={endCall}
              className="p-4 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all transform active:scale-95 ml-2"
              title="End Call"
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Audio-only Call Layout (Calling, Ringing or Connected: Small Card)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] w-full max-w-sm rounded-[40px] p-10 flex flex-col items-center shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        
        {/* Profile */}
        <div className="relative mb-8">
          <div className="relative mb-8">
            <div className={`absolute -inset-4 rounded-full blur-xl bg-purple-500/20 ${isConnected ? 'animate-pulse' : 'animate-ping'}`}></div>
            <img 
              src={partnerAvatar || `https://ui-avatars.com/api/?name=${partnerName}&background=random`} 
              alt={partnerName}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/10 relative z-10"
            />
          </div>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-2">{partnerName}</h3>
        <p className="text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
          {isConnected 
            ? `On Voice Call • ${formatDuration(duration)}` 
            : isRinging 
              ? 'Ringing...' 
              : 'Calling (Voice)...'}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button 
            onClick={toggleMute}
            className={`p-5 rounded-full transition-all duration-300 ${
              isMuted ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button 
            onClick={endCall}
            className="p-6 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all transform active:scale-90"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
