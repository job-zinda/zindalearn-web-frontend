import {
  Bell, CheckCircle2, MessageSquare, AlertCircle, Info,
  GraduationCap, DollarSign, Calendar, UserPlus, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { notifications, markAsRead, markAllRead } = useNotifications();

  const getIconData = (type) => {
    switch(type) {
      case 'enrollment':
        return { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-100' };
      case 'course_approved':
        return { icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'course_declined':
        return { icon: GraduationCap, color: 'text-rose-600', bg: 'bg-rose-100' };
      case 'payout_approved':
        return { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'payout_rejected':
        return { icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-100' };
      case 'live_class':
        return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'message':
      case 'support_reply':
      case 'support_resolved':
        return { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'account_blocked':
        return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' };
      case 'account_restored':
        return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'warning':
      case 'error':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Notifications</h1>
          <p className="text-slate-500 text-sm">Stay updated with your courses and student activity.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-xl transition-all"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const { icon: Icon, color, bg } = getIconData(n.type);
            return (
              <div 
                key={n._id} 
                className={`group relative bg-white p-6 rounded-[32px] border transition-all duration-300 flex items-start gap-5 ${
                  n.isRead ? 'border-slate-100 opacity-75' : 'border-purple-100 shadow-xl shadow-purple-500/5'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute top-6 right-8 w-2 h-2 bg-purple-600 rounded-full"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{n.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{n.message}</p>
                  
                  <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n._id)} className="text-[10px] font-bold text-purple-600 uppercase tracking-widest hover:underline">
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-100 p-20 text-center">
            <Bell className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You're all caught up!</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium italic">
            "Tip: Regular student engagement leads to 30% higher course completion rates."
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
