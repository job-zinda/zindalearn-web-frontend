import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Users,
  Megaphone,
  Plus,
  MessageCircle,
  BookOpen,
  Phone,
  Video
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCall } from "../../features/calls/context/CallContext";
import VoiceRecorder from "../../features/calls/components/VoiceRecorder";
import AudioMessage from "../../features/calls/components/AudioMessage";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getEligibleContacts,
  broadcastMessage,
  markAsRead,
  uploadMessageFile
} from "../../services/messageService";
import socketService from "../../services/socket";
import toast from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const { startCall, isConnected: isCallConnected, isCalling } = useCall();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [eligibleContacts, setEligibleContacts] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      fetchConversations();
    };

    const handleUserTyping = ({ userName, conversationId }) => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: userName }));
    };

    const handleUserStoppedTyping = ({ conversationId }) => {
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[conversationId];
        return newState;
      });
    };

    const handleMessageSeen = ({ conversationId, userId }) => {
      // If we are looking at this conversation, update the messages
      setMessages(prev => prev.map(msg => {
        const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
        // If the seen event is from the OTHER user and we are the SENDER
        if (userId !== (currentUser?._id || currentUser?.id) && senderId === (currentUser?._id || currentUser?.id)) {
          if (!msg.readBy.includes(userId)) {
            return { ...msg, readBy: [...msg.readBy, userId] };
          }
        }
        return msg;
      }));
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);
    socketService.onMessageSeen(handleMessageSeen);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offUserTyping(handleUserTyping);
      socketService.offUserStoppedTyping(handleUserStoppedTyping);
      socketService.offMessageSeen(handleMessageSeen);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      socketService.joinConversation(selectedConversation._id);
      
      // Mark as read when opening
      markAsRead(selectedConversation._id).catch(console.error);
      
      return () => {
        socketService.leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
      if (data.conversations?.length > 0 && !selectedConversation) {
        setSelectedConversation(data.conversations[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const data = await getMessages(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!text.trim() && attachments.length === 0) || !selectedConversation) return;

    // Safety Checks: Ensure we have a valid course and receiver context
    const courseId = selectedConversation.course?._id;
    let receiverId = null;

    if (currentUser.role === 'student') {
      // Students ALWAYS message the instructor of the course
      receiverId = selectedConversation.course?.instructor?._id || selectedConversation.course?.instructor;
    } else {
      // Instructors message the student in the conversation
      const otherUser = selectedConversation.participants.find(p => {
        const pId = typeof p === 'object' ? (p._id || p.id) : p;
        const cId = currentUser?._id || currentUser?.id;
        return pId && cId && pId.toString() !== cId.toString();
      });
      receiverId = otherUser?._id || otherUser?.id;
    }

    if (!receiverId || !courseId) {
      toast.error("Invalid conversation context. Missing receiver or course.");
      return;
    }

    const messageContent = text;
    const messageAttachments = attachments;
    setText("");
    setAttachments([]);
    setShowEmojiPicker(false);

    try {
      const data = await sendMessage({
        receiverId,
        courseId,
        text: messageContent,
        attachments: messageAttachments
      });
      
      // Add message immediately for sender (Optimistic UI)
      setMessages(prev => [...prev, {
        ...data.message,
        sender: { _id: (currentUser?._id || currentUser?.id), name: currentUser.name, avatar: currentUser.avatar }
      }]);
      
      fetchConversations();
      socketService.emitStopTyping(selectedConversation._id);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send message";
      toast.error(errorMsg);
      setText(messageContent);
    }
  };
  const handleStartNewChat = async (contact) => {
    try {
      // Create or find conversation
      const data = await sendMessage({
        receiverId: contact.user._id,
        courseId: contact.course._id,
        text: "Started a new conversation."
      });
      
      setShowNewChatModal(false);
      fetchConversations();
      // Logic to select the newly created conversation
      const newConv = conversations.find(c => c._id === data.conversationId);
      if (newConv) setSelectedConversation(newConv);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to start chat";
      toast.error(errorMsg);
    }
  };

  const handleSendVoiceMessage = async (audioBlob, duration) => {
    if (!selectedConversation) return;

    try {
      setIsUploading(true);
      const loadingToast = toast.loading("Sending voice message...");
      
      const file = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
      const uploadData = await uploadMessageFile(file);

      // Safety Checks: Ensure we have a valid course and receiver context
      const courseId = selectedConversation.course?._id;
      let receiverId = null;

      if (currentUser.role === 'student') {
        receiverId = selectedConversation.course?.instructor?._id || selectedConversation.course?.instructor;
      } else {
        const otherUser = selectedConversation.participants.find(p => {
          const pId = typeof p === 'object' ? (p._id || p.id) : p;
          const cId = currentUser?._id || currentUser?.id;
          return pId && cId && pId.toString() !== cId.toString();
        });
        receiverId = otherUser?._id || otherUser?.id;
      }

      const data = await sendMessage({
        receiverId,
        courseId,
        messageType: 'audio',
        audioUrl: uploadData.url,
        audioDuration: duration
      });

      setMessages(prev => [...prev, {
        ...data.message,
        sender: { _id: (currentUser?._id || currentUser?.id), name: currentUser.name, avatar: currentUser.avatar }
      }]);
      
      toast.success("Voice message sent!", { id: loadingToast });
      fetchConversations();
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBroadcast = async (courseId, broadcastText) => {
    try {
      await broadcastMessage({ courseId, text: broadcastText });
      toast.success("Broadcast sent!");
      setShowBroadcastModal(false);
      fetchConversations();
    } catch (error) {
      toast.error("Failed to send broadcast");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("File size must be less than 10MB");
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading("Uploading file...");
      const data = await uploadMessageFile(file);
      
      setAttachments(prev => [...prev, {
        url: data.url,
        name: data.originalName,
        type: data.resourceType,
        format: data.format
      }]);
      
      toast.success("File uploaded!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    
    if (selectedConversation) {
      socketService.emitTyping(selectedConversation._id, currentUser.name);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitStopTyping(selectedConversation._id);
      }, 3000);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200 animate-fade-in">
      
      {/* LEFT: CONVERSATIONS LIST */}
      <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
            <div className="flex gap-2">
              {currentUser.role === 'instructor' && (
                <button 
                  onClick={() => setShowBroadcastModal(true)}
                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all shadow-sm"
                  title="Broadcast"
                >
                  <Megaphone size={18} />
                </button>
              )}
              <button 
                onClick={async () => {
                  const data = await getEligibleContacts();
                  setEligibleContacts(data.contacts);
                  setShowNewChatModal(true);
                }}
                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-all shadow-sm"
                title="New Chat"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search chats..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 border border-transparent focus:border-purple-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const otherUser = conv.participants.find(p => {
                const pId = typeof p === 'object' ? (p._id || p.id) : p;
                const cId = currentUser?._id || currentUser?.id;
                return pId && cId && pId.toString() !== cId.toString();
              });
              const isSelected = selectedConversation?._id === conv._id;
              
              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? "bg-purple-50/50 border-purple-600 shadow-sm"
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={otherUser?.avatar || "https://ui-avatars.com/api/?name=" + otherUser?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                      alt={otherUser?.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{otherUser?.name}</p>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0 uppercase tracking-tighter">
                        {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-600 font-bold truncate mb-1 flex items-center gap-1 uppercase tracking-widest">
                      <BookOpen size={10} /> {conv.course?.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate leading-relaxed">
                      {conv.lastMessage?.sender === (currentUser?._id || currentUser?.id) ? "You: " : ""}{conv.lastMessage?.text}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center opacity-40">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No active chats</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#fafafa]">
        {selectedConversation ? (
          <>
            {/* HEADER */}
            {(() => {
              const otherUser = selectedConversation.participants.find(p => {
                const pId = typeof p === 'object' ? (p._id || p.id) : p;
                const cId = currentUser?._id || currentUser?.id;
                return pId && cId && pId.toString() !== cId.toString();
              });
              return (
                <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 shadow-sm z-10">
                  <div className="flex items-center gap-4">
                    <img
                      src={otherUser?.avatar || "https://ui-avatars.com/api/?name=" + otherUser?.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                      alt={otherUser?.name}
                    />
                    <div>
                      <p className="text-lg font-black text-gray-900 tracking-tight">{otherUser?.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          {otherUser?.role} • {selectedConversation.course?.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {typingUsers[selectedConversation._id] && (
                      <div className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold animate-pulse uppercase tracking-widest hidden md:block">
                        {typingUsers[selectedConversation._id]} is typing...
                      </div>
                    )}
                    <button 
                      onClick={() => startCall(
                        otherUser?._id || otherUser?.id, 
                        otherUser?.name, 
                        otherUser?.avatar, 
                        selectedConversation._id,
                        'audio'
                      )}
                      disabled={isCallConnected || isCalling}
                      className="p-3 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg shadow-purple-200 group relative"
                      title="Voice Call"
                    >
                      <Phone size={20} />
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Voice Call
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => startCall(
                        otherUser?._id || otherUser?.id, 
                        otherUser?.name, 
                        otherUser?.avatar, 
                        selectedConversation._id,
                        'video'
                      )}
                      disabled={isCallConnected || isCalling}
                      className="p-3 bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg shadow-cyan-200 group relative"
                      title="Video Call"
                    >
                      <Video size={20} />
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Video Call
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#f0f2f5]/30">
              {messagesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => {
                  // SENDER NORMALIZATION FIX:
                  const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                  const currentUserId = currentUser?._id || currentUser?.id;
                  const isMe = senderId === currentUserId;
                  
                  // In a direct chat, if the OTHER person has read it, it's "read"
                  const isRead = msg.readBy && msg.readBy.some(id => id !== senderId);
                  const isDelivered = true; 
                  
                  const prevMsgSenderId = idx > 0 ? (typeof messages[idx-1].sender === 'object' ? messages[idx-1].sender._id : messages[idx-1].sender) : null;
                  const showAvatar = !isMe && (idx === 0 || prevMsgSenderId !== senderId);

                  return (
                    <div
                      key={msg._id}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex items-end gap-3 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar only for other person */}
                        {!isMe && (
                          <div className="w-8 h-8 shrink-0 mb-1">
                            {showAvatar ? (
                              <img 
                                src={msg.sender?.avatar || "https://ui-avatars.com/api/?name=" + (msg.sender?.name || 'User')} 
                                className="w-full h-full rounded-full object-cover shadow-sm ring-2 ring-white"
                                alt="avatar"
                              />
                            ) : (
                              <div className="w-8" /> 
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            style={{
                              background: isMe 
                                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                                : 'linear-gradient(135deg, #f6f9fc 0%, #e9eff5 100%)'
                            }}
                            className={`px-5 py-3 shadow-md ${
                              isMe
                                ? "text-white rounded-[22px] rounded-br-none"
                                : "text-gray-700 rounded-[22px] rounded-bl-none border border-gray-100"
                            }`}
                          >
                            {msg.messageType === 'audio' ? (
                              <AudioMessage url={msg.audioUrl} duration={msg.audioDuration} isMe={isMe} />
                            ) : (
                              <p className="text-[14.5px] leading-relaxed font-medium whitespace-pre-wrap break-words">
                                {msg.text}
                              </p>
                            )}
                          </div>
                          
                          <div className={`flex items-center mt-1.5 px-1 gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <div className="flex">
                                <svg viewBox="0 0 16 11" width="14" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    d="M11.0001 1.5L5.50006 7L3.00006 4.5" 
                                    stroke={isRead ? "#38bdf8" : "#94a3b8"} 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                  <path 
                                    d="M14.5001 1.5L9.00006 7L8.00006 6" 
                                    stroke={isRead ? "#38bdf8" : isDelivered ? "#94a3b8" : "transparent"} 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`mt-2 flex flex-wrap gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                              {msg.attachments.map((file, i) => (
                                <a 
                                  key={i}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all group"
                                >
                                  <Paperclip size={14} className="text-purple-600" />
                                  <span className="text-[11px] font-bold text-gray-700 truncate max-w-[150px]">{file.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle className="w-10 h-10 opacity-20" />
                  </div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Private Channel</h4>
                  <p className="text-xs font-bold text-gray-400 mt-2">Messages are secure and encrypted</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>            {/* INPUT AREA */}
            <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-4">
              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100 group relative">
                      <Paperclip size={12} />
                      <span className="text-[10px] font-bold truncate max-w-[100px]">{file.name}</span>
                      <button 
                        onClick={() => removeAttachment(i)}
                        className="w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300 transition-colors"
                      >
                        <Plus size={10} className="rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all duration-200 disabled:opacity-50"
                  >
                    <Paperclip size={20} />
                  </button>
                  <div className="relative" ref={emojiPickerRef}>
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-3 rounded-full transition-all duration-200 ${showEmojiPicker ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                    >
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-4 z-[100] shadow-2xl scale-90 origin-bottom-left">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                  </div>
                  <VoiceRecorder onSend={handleSendVoiceMessage} />
                </div>

                <div className="flex-1 relative group">
                  <input
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message here..."
                    disabled={isUploading}
                    className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-[30px] text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:bg-white focus:border-cyan-200 transition-all font-medium placeholder:text-gray-400 disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={(!text.trim() && attachments.length === 0) || isUploading}
                  style={{
                    background: (text.trim() || attachments.length > 0) ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : '#f3f4f6'
                  }}
                  className={`p-4 rounded-full transition-all duration-300 transform active:scale-90 ${
                    (text.trim() || attachments.length > 0)
                      ? "text-white shadow-lg shadow-cyan-200 rotate-0"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Send size={20} className={(text.trim() || attachments.length > 0) ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-fade-in">
            <div className="w-32 h-32 bg-white rounded-[48px] shadow-2xl shadow-purple-500/10 flex items-center justify-center mb-8 border border-slate-50">
              <MessageCircle size={48} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Your Conversations</h3>
            <p className="text-gray-500 max-w-sm leading-relaxed font-medium">
              Select a chat from the sidebar to view your messages or start a new one with your instructors.
            </p>
            <button 
              onClick={async () => {
                const data = await getEligibleContacts();
                setEligibleContacts(data.contacts);
                setShowNewChatModal(true);
              }}
              className="mt-8 px-8 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">New Conversation</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {eligibleContacts.length > 0 ? (
                eligibleContacts.map((contact, i) => (
                  <div 
                    key={i}
                    onClick={() => handleStartNewChat(contact)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl cursor-pointer transition-all border border-transparent hover:border-gray-100 mb-2"
                  >
                    <img 
                      src={contact.user.avatar || "https://ui-avatars.com/api/?name=" + contact.user.name} 
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{contact.user.name}</p>
                      <p className="text-[11px] text-purple-600 font-bold uppercase tracking-widest">{contact.course.title}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 font-medium">
                  No eligible contacts found. Make sure you are enrolled in a course.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BROADCAST MODAL (Instructor Only) */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden p-10">
             <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Send Broadcast</h3>
             <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Course</label>
                  <select className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-500/20">
                    <option>Select a course</option>
                    {/* Map instructor courses here */}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea className="w-full mt-2 p-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-purple-500/20 resize-none" rows="4" placeholder="Enter broadcast message..."></textarea>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowBroadcastModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all">Cancel</button>
                  <button className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all">Send Now</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;