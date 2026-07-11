import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../../../services/socket';
import peerService from '../services/peerService';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const [call, setCall] = useState({
    isReceiving: false,
    isCalling: false,
    isRinging: false,
    isConnected: false,
    partnerId: null,
    partnerName: '',
    partnerAvatar: '',
    conversationId: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    duration: 0,
    callType: 'audio', // 'audio' | 'video'
    isCameraOn: true
  });

  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(new Audio());

  const resetCall = useCallback(() => {
    console.log('[CALL] Resetting call state and cleaning up');
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`[CALL] Stopped local track: ${track.kind}`);
      });
      localStreamRef.current = null;
    }
    remoteAudioRef.current.srcObject = null;
    peerService.destroy();
    
    setCall({
      isReceiving: false,
      isCalling: false,
      isRinging: false,
      isConnected: false,
      partnerId: null,
      partnerName: '',
      partnerAvatar: '',
      conversationId: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      duration: 0,
      callType: 'audio',
      isCameraOn: true
    });
  }, []);

  const handleIncomingCall = useCallback((data) => {
    console.log('[CALL] Incoming call from:', data.callerName, 'Type:', data.callType);
    setCall(prev => ({
      ...prev,
      isReceiving: true,
      partnerId: data.callerId,
      partnerName: data.callerName,
      partnerAvatar: data.callerAvatar,
      conversationId: data.conversationId,
      callType: data.callType || 'audio',
      isCameraOn: true
    }));
  }, []);

  const handleCallRinging = useCallback(() => {
    console.log('[CALL] Remote user is ringing');
    setCall(prev => ({ ...prev, isRinging: true }));
  }, []);

  const handleCallAccepted = useCallback(async ({ receiverId }) => {
    console.log('[CALL] Call accepted by:', receiverId);
    
    try {
      const peer = peerService.getPeer();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peer.addTrack(track, localStreamRef.current);
          console.log(`[CALL] Added local track on accept: ${track.kind}`);
        });
      }

      setCall(prev => ({ ...prev, isCalling: false, isRinging: false, isConnected: true }));
      
      timerRef.current = setInterval(() => {
        setCall(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      const offer = await peerService.getOffer();
      socketService.emitWebRTCOffer({ to: receiverId, offer });
      console.log('[CALL] WebRTC Offer sent');
    } catch (err) {
      console.error('[CALL] Error establishing peer connection on accept:', err);
      toast.error('Failed to establish connection');
    }
  }, []);

  const handleWebRTCOffer = useCallback(async ({ from, offer }) => {
    console.log('[CALL] WebRTC Offer received');
    try {
      const answer = await peerService.getAnswer(offer);
      socketService.emitWebRTCAnswer({ to: from, answer });
      console.log('[CALL] WebRTC Answer sent');
    } catch (err) {
      console.error('[CALL] Error creating answer:', err);
    }
  }, []);

  const handleWebRTCAnswer = useCallback(async ({ from, answer }) => {
    console.log('[CALL] WebRTC Answer received');
    try {
      await peerService.setRemoteDescription(answer);
      console.log('[CALL] Remote description set');
    } catch (err) {
      console.error('[CALL] Error setting remote description:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async ({ from, candidate }) => {
    try {
      await peerService.addIceCandidate(candidate);
    } catch (err) {
      console.error('[CALL] Error adding ICE candidate:', err);
    }
  }, []);

  const handleCallEnded = useCallback(() => {
    console.log('[CALL] Call ended by partner');
    toast('Call ended');
    resetCall();
  }, [resetCall]);

  const handleCallError = useCallback((data) => {
    console.error('[CALL] Call error:', data.message);
    toast.error(data.message);
    resetCall();
  }, [resetCall]);

  // Socket Listeners Management
  useEffect(() => {
    socketService.onIncomingCall(handleIncomingCall);
    socketService.onCallRinging(handleCallRinging);
    socketService.onCallAccepted(handleCallAccepted);
    socketService.onCallRejected(() => {
      toast.error('Call rejected');
      resetCall();
    });
    socketService.onCallEnded(handleCallEnded);
    socketService.onWebRTCOffer(handleWebRTCOffer);
    socketService.onWebRTCAnswer(handleWebRTCAnswer);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallError(handleCallError);

    return () => {
      socketService.offCallEvents();
    };
  }, [
    user,
    handleIncomingCall,
    handleCallRinging,
    handleCallAccepted,
    handleCallEnded,
    handleWebRTCOffer,
    handleWebRTCAnswer,
    handleIceCandidate,
    handleCallError,
    resetCall
  ]);

  // Peer Event Listeners
  useEffect(() => {
    const peer = peerService.getPeer();
    
    peer.onicecandidate = (event) => {
      if (event.candidate && call.partnerId) {
        socketService.emitIceCandidate({ to: call.partnerId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      console.log('[CALL] Remote track received:', event.track.kind);
      const [remoteStream] = event.streams;
      setCall(prev => ({ ...prev, remoteStream }));
      
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        if (call.callType !== 'video') {
          remoteAudioRef.current.play().catch(e => {
            console.error("[CALL] Auto-play prevented or failed:", e);
            toast('Click anywhere to enable audio');
          });
        } else {
          remoteAudioRef.current.pause();
        }
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log('[CALL] ICE Connection State:', peer.iceConnectionState);
      if (peer.iceConnectionState === 'failed') {
        toast.error('Connection failed. Please try again.');
        resetCall();
      }
      if (peer.iceConnectionState === 'disconnected') {
        // We don't necessarily end immediately as it might reconnect
        console.warn('[CALL] Connection unstable');
      }
    };
  }, [call.partnerId, call.callType, resetCall]);

  const startCall = async (receiverId, receiverName, receiverAvatar, conversationId, callType = 'audio') => {
    if (call.isCalling || call.isConnected || call.isReceiving) {
      toast.error('A call is already in progress');
      return;
    }
    try {
      console.log('[CALL] Starting call to:', receiverName, 'Type:', callType);
      const constraints = { 
        audio: true, 
        video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      setCall(prev => ({
        ...prev,
        isCalling: true,
        partnerId: receiverId,
        partnerName: receiverName,
        partnerAvatar: receiverAvatar,
        conversationId,
        localStream: stream,
        callType,
        isCameraOn: callType === 'video'
      }));

      socketService.emitCallUser({ receiverId, conversationId, callType });
    } catch (err) {
      console.error('[CALL] Media Error:', err);
      toast.error('Microphone/Camera access denied. Please check your browser settings.');
    }
  };

  const acceptCall = async () => {
    try {
      console.log('[CALL] Accepting call from:', call.partnerName, 'Type:', call.callType);
      const constraints = { 
        audio: true, 
        video: call.callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      const peer = peerService.getPeer();
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
        console.log(`[CALL] Added local track: ${track.kind}`);
      });

      setCall(prev => ({ 
        ...prev, 
        isReceiving: false, 
        isConnected: true, 
        localStream: stream,
        isCameraOn: call.callType === 'video'
      }));

      timerRef.current = setInterval(() => {
        setCall(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      socketService.emitAcceptCall({ callerId: call.partnerId });
    } catch (err) {
      console.error('[CALL] Media Error:', err);
      toast.error('Microphone/Camera access denied');
      rejectCall();
    }
  };

  const rejectCall = () => {
    console.log('[CALL] Rejecting call');
    socketService.emitRejectCall({ callerId: call.partnerId });
    resetCall();
  };

  const endCall = () => {
    console.log('[CALL] Ending call');
    socketService.emitEndCall({ partnerId: call.partnerId, duration: call.duration });
    resetCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setCall(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
      console.log('[CALL] Mute toggled:', !audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCall(prev => ({ ...prev, isCameraOn: videoTrack.enabled }));
        console.log('[CALL] Camera toggled:', videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider value={{
      ...call,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera
    }}>
      {children}
    </CallContext.Provider>
  );
};
