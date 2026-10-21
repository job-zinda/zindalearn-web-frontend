import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { captureReferralFromUrl } from '../../utils/referral';

const ReferralCapture = () => {
  const location = useLocation();
  useEffect(() => {
    try {
      captureReferralFromUrl();
    } catch (error) {
      console.error('Referral link could not be saved:', error);
      toast.error(error.message);
    }
  }, [location.pathname, location.search]);
  return null;
};

export default ReferralCapture;
