import {
  Bell, CheckCircle2, MessageSquare, AlertCircle, Info,
  GraduationCap, DollarSign, Calendar, UserPlus, ShieldAlert, ShieldCheck,
  CheckCheck, Inbox
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
  const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getIconData = (type) => {
    switch (type) {
      case 'enrollment':
        return { icon: UserPlus, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'course_approved':
        return { icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'course_declined':
        return { icon: GraduationCap, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'payout_approved':
        return { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'payout_rejected':
        return { icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'live_class':
        return { icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'message':
      case 'support_reply':
      case 'support_resolved':
        return { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'account_blocked':
        return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'account_restored':
        return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'warning':
      case 'error':
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' };
      default:
        return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    }
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {unreadCount > 0 ? (
              <span><span className="text-indigo-400 font-semibold">{unreadCount} unread</span> · {notifications.length} total</span>
            ) : (
              <span>All caught up · {notifications.length} total</span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <Inbox className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-300">No notifications yet</p>
          <p className="text-xs text-slate-500 mt-1">Platform events will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {unread.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Unread</p>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl divide-y divide-slate-700/40 overflow-hidden">
                {unread.map(notification => {
                  const { icon: Icon, color, bg } = getIconData(notification.type);
                  return (
                    <div
                      key={notification._id}
                      onClick={() => {
                        markAsRead(notification._id);
                        if (notification.link) navigate(notification.link);
                      }}
                      className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-800/80 cursor-pointer transition-colors group relative"
                    >
                      {/* Unread dot */}
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 leading-snug">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                          className="flex-shrink-0 p-1 hover:bg-slate-700 rounded text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Earlier</p>
              <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl divide-y divide-slate-700/30 overflow-hidden">
                {read.map(notification => {
                  const { icon: Icon, color, bg } = getIconData(notification.type);
                  return (
                    <div
                      key={notification._id}
                      onClick={() => { if (notification.link) navigate(notification.link); }}
                      className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors opacity-60"
                    >
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 leading-snug">{notification.message}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
