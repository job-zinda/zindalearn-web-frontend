import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/userService';

export const useUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setUserData(data.user);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { userData, loading, error, refetch: fetchUser };
};
