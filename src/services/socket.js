import { io } from 'socket.io-client';

// In production (Vercel): VITE_SOCKET_URL is empty → connect to Vercel origin.
// Vercel rewrites /socket.io/* → EC2:5005 so no mixed-content issue.
// In development: Vite server.proxy handles /api, and socket connects to localhost:5005 directly.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketService {
  socket = null;
  listeners = new Map(); // event -> Set of callbacks

  _registerListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    this.socket?.on(event, callback);
  }

  _removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    if (callback) {
      callbacks.delete(callback);
      this.socket?.off(event, callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  connect(token) {
    if (this.socket) {
      if (this.socket.auth.token !== token) {
        this.socket.disconnect();
      } else {
        if (!this.socket.connected) {
          this.socket.connect();
        }
        return;
      }
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      // Allow polling first so it works behind reverse proxies (nginx, AWS ALB)
      // Socket.IO will automatically upgrade to websocket when possible
      transports: ['polling', 'websocket'],
    });

    // Re-bind all registered listeners to the new socket
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket Connection Error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  emitTyping(conversationId, userName) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, userName });
    }
  }

  emitStopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { conversationId });
    }
  }

  onNewMessage(callback) {
    this._registerListener('newMessage', callback);
  }

  onUserTyping(callback) {
    this._registerListener('userTyping', callback);
  }

  onUserStoppedTyping(callback) {
    this._registerListener('userStoppedTyping', callback);
  }

  onMessageSeen(callback) {
    this._registerListener('messageSeen', callback);
  }

  onNotification(callback) {
    this._registerListener('newNotification', callback);
  }

  onLiveClassStarted(callback) {
    this._registerListener('liveClassStarted', callback);
  }

  onLiveClassEnded(callback) {
    this._registerListener('liveClassEnded', callback);
  }

  onLiveClassScheduled(callback) {
    this._registerListener('liveClassScheduled', callback);
  }

  markAsSeen(conversationId, messageIds) {
    if (this.socket) {
      this.socket.emit('markAsSeen', { conversationId, messageIds });
    }
  }

  // Remove listeners to prevent memory leaks
  offNewMessage(callback) {
    this._removeListener('newMessage', callback);
  }

  offUserTyping(callback) {
    this._removeListener('userTyping', callback);
  }

  offUserStoppedTyping(callback) {
    this._removeListener('userStoppedTyping', callback);
  }

  offMessageSeen(callback) {
    this._removeListener('messageSeen', callback);
  }

  offNotification(callback) {
    this._removeListener('newNotification', callback);
  }

  offLiveClassStarted(callback) {
    this._removeListener('liveClassStarted', callback);
  }

  offLiveClassEnded(callback) {
    this._removeListener('liveClassEnded', callback);
  }

  offLiveClassScheduled(callback) {
    this._removeListener('liveClassScheduled', callback);
  }

  // Voice Call Signaling
  emitCallUser(data) {
    this.socket?.emit('call-user', data);
  }

  emitAcceptCall(data) {
    this.socket?.emit('accept-call', data);
  }

  emitRejectCall(data) {
    this.socket?.emit('reject-call', data);
  }

  emitWebRTCOffer(data) {
    this.socket?.emit('webrtc-offer', data);
  }

  emitWebRTCAnswer(data) {
    this.socket?.emit('webrtc-answer', data);
  }

  emitIceCandidate(data) {
    this.socket?.emit('ice-candidate', data);
  }

  emitEndCall(data) {
    this.socket?.emit('end-call', data);
  }

  onIncomingCall(callback) {
    this._registerListener('incoming-call', callback);
  }

  onCallRinging(callback) {
    this._registerListener('call-ringing', callback);
  }

  onCallAccepted(callback) {
    this._registerListener('call-accepted', callback);
  }

  onCallRejected(callback) {
    this._registerListener('call-rejected', callback);
  }

  onCallEnded(callback) {
    this._registerListener('call-ended', callback);
  }

  onWebRTCOffer(callback) {
    this._registerListener('webrtc-offer', callback);
  }

  onWebRTCAnswer(callback) {
    this._registerListener('webrtc-answer', callback);
  }

  onIceCandidate(callback) {
    this._registerListener('ice-candidate', callback);
  }

  onCallError(callback) {
    this._registerListener('call-error', callback);
  }

  // Cleanup for calls
  offCallEvents() {
    this._removeListener('incoming-call');
    this._removeListener('call-ringing');
    this._removeListener('call-accepted');
    this._removeListener('call-rejected');
    this._removeListener('call-ended');
    this._removeListener('webrtc-offer');
    this._removeListener('webrtc-answer');
    this._removeListener('ice-candidate');
    this._removeListener('call-error');
  }
}

const socketService = new SocketService();
export default socketService;
