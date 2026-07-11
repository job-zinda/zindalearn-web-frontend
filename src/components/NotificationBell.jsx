import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  MessageSquare, 
  GraduationCap, 
  DollarSign, 
  Calendar, 
  UserPlus, 
  ShieldAlert, 
  ShieldCheck, 
  Info,
  CheckCircle,
  Inbox,
  BellRing
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      support_reply: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
      support_resolved: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
      message: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
      course_approved: { icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      course_declined: { icon: GraduationCap, color: 'text-rose-600', bg: 'bg-rose-50' },
      payout_approved: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      payout_rejected: { icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
      live_class: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
      enrollment: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      account_blocked: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
      account_restored: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    };

    const config = iconMap[type] || { icon: Info, color: 'text-zinc-500', bg: 'bg-zinc-100' };
    const IconComponent = config.icon;

    return (
      <div className={`p-2 ${config.bg} rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
      </div>
    );
  };

  const getViewAllLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/notifications';
    if (user.role === 'instructor') return '/instructor/notifications';
    return '/student/notifications';
  };

  const latestNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 focus:outline-none"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary-600 rounded-full text-white text-[9px] font-black border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-zinc-200/60 rounded-2xl shadow-xl shadow-zinc-200/50 overflow-hidden z-50"
          style={{ animation: 'notifSlideIn 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/80">
            <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded-md">
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
            {latestNotifications.length > 0 ? (
              latestNotifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer relative group ${
                    !notif.isRead ? 'bg-primary-50/40' : ''
                  }`}
                >
                  {getNotificationIcon(notif.type)}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${notif.isRead ? 'text-zinc-500' : 'text-zinc-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="block text-[11px] text-zinc-400 font-medium">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Mark as read inline button */}
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-200/60 rounded-lg text-zinc-400 hover:text-zinc-700 transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Inbox className="w-7 h-7 text-zinc-300" />
                </div>
                <div>
                  <p className="text-zinc-500 text-sm font-semibold">No notifications yet</p>
                  <p className="text-zinc-400 text-xs mt-1">We'll notify you when something arrives</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 bg-zinc-50/80 text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate(getViewAllLink());
              }}
              className="block w-full py-3 text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-zinc-100 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
