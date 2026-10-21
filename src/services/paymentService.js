import api from './api';

export const createOrder = async (courseId, referralCode = '') => {
  const response = await api.post('/payment/create-order', { courseId, referralCode });
  return response.data;
};

export const verifyReferral = async (referralCode) => {
  const response = await api.post('/payment/verify-referral', { referralCode });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payment/verify-payment', paymentData);
  return response.data;
};
