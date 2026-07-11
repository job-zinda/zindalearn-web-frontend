import { useState, useEffect } from 'react';
import socketService from '../../../services/socket';
import liveClassService from '../services/liveClassService';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useLiveClasses = () => {
  const { token } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await liveClassService.getStudentLiveClasses();
      if (response.success) {
        setLiveClasses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();

    // Socket listeners handlers
    const handleStarted = ({ liveClassId, title }) => {
      toast.success(`Live Class Started: ${title}`, {
        duration: 5000
      });
      // Update state if exists, otherwise refetch to get the new live class
      setLiveClasses(prev => {
        const exists = prev.find(c => c._id === liveClassId);
        if (exists) {
          return prev.map(c => c._id === liveClassId ? { ...c, status: 'live' } : c);
        } else {
          fetchLiveClasses(); // Fetch if it's a new class we didn't have
          return prev;
        }
      });
    };

    const handleEnded = ({ liveClassId, title }) => {
      toast.error(`Live Class Ended: ${title}`, {
        duration: 5000
      });
      setLiveClasses(prev => prev.map(c =>
        c._id === liveClassId ? { ...c, status: 'ended' } : c
      ));
    };

    const handleScheduled = ({ title }) => {
      toast.success(`New Live Class Scheduled: ${title}`);
      fetchLiveClasses();
    };

    // Bind listeners using global service helpers
    socketService.onLiveClassStarted(handleStarted);
    socketService.onLiveClassEnded(handleEnded);
    socketService.onLiveClassScheduled(handleScheduled);

    return () => {
      // Cleanup listeners
      socketService.offLiveClassStarted(handleStarted);
      socketService.offLiveClassEnded(handleEnded);
      socketService.offLiveClassScheduled(handleScheduled);
    };
  }, [token]);

  return { liveClasses, loading, refetch: fetchLiveClasses };
};
