class PeerService {
  constructor() {
    this.peer = null;
    this.iceCandidateQueue = [];
    this.config = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    };
  }

  getPeer() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection(this.config);
    }
    return this.peer;
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));
      
      // Process queued ICE candidates
      await this.processQueuedCandidates();
      
      return answer;
    }
  }

  async setRemoteDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      await this.processQueuedCandidates();
    }
  }

  async addIceCandidate(candidate) {
    if (this.peer && this.peer.remoteDescription) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      this.iceCandidateQueue.push(candidate);
    }
  }

  async processQueuedCandidates() {
    if (this.peer && this.peer.remoteDescription) {
      while (this.iceCandidateQueue.length > 0) {
        const candidate = this.iceCandidateQueue.shift();
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  }

  destroy() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
      this.iceCandidateQueue = [];
    }
  }
}

export default new PeerService();
