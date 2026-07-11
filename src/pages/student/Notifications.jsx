import {
  Bell, CheckCircle2, AlertCircle, Info, ArrowLeft, MessageSquare,
  GraduationCap, DollarSign, Calendar, UserPlus, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StudentNotifications = () => {
  const { notifications, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all shadow-sm lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display">Notifications</h1>
            <p className="text-slate-500 text-sm font-medium">Stay updated with your learning journey.</p>
          </div>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-5 py-2.5 rounded-xl transition-all shadow-sm border border-primary-100"
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
                  n.isRead ? 'border-slate-100 opacity-80' : 'border-primary-100 shadow-xl shadow-primary-500/5 ring-1 ring-primary-50/50'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute top-6 right-8 w-2 h-2 bg-primary-600 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.5)]"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg} ${color} shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{n.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">{n.message}</p>
                  
                  <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)} 
                        className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[40px] border border-slate-100 p-24 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">No notifications yet</p>
            <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">We'll notify you when something important happens in your learning journey.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-10 p-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-[32px] border border-primary-100 text-center shadow-sm">
          <p className="text-sm text-primary-700 font-bold italic">
            "Tip: Students who check notifications daily are 2x more likely to finish their courses!"
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
