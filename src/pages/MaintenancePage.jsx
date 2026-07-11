import { Link } from 'react-router-dom';
import { Hammer, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300 relative overflow-hidden font-sans">
      {/* Dynamic Background Glowing Circles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        
        {/* Animated Icon Container */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20"
        >
          <Hammer className="w-12 h-12 text-white animate-pulse" />
        </motion.div>

        {/* Text Area */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display"
          >
            System Maintenance
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Zinda Learn is currently undergoing scheduled platform updates. Our servers will be back online shortly. We apologize for the inconvenience.
          </motion.p>
        </div>

        {/* Informative Grid */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500 font-medium">Estimated Downtime</span>
            <span className="text-indigo-400 font-bold">~30 minutes</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500 font-medium">Platform Status</span>
            <span className="text-purple-400 font-bold">Upgrading Database</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Public Access</span>
            <span className="text-red-400 font-bold">Temporarily Disabled</span>
          </div>
        </motion.div>

        {/* Admin Login link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-6 border-t border-slate-900 flex justify-center items-center"
        >
          <Link 
            to="/admin/login" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors bg-slate-900/30 px-4 py-2 rounded-full border border-slate-800/40"
          >
            <Shield className="w-3.5 h-3.5" />
            Administrator Console Access
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default MaintenancePage;
