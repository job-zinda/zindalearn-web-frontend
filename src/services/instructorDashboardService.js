import api from './api';

// ── PAYOUTS ──────────────────────────────────────────────────────────────────
export const getPayoutData = async () => {
  const response = await api.get('/instructor/payouts');
  return response.data;
};

export const requestWithdrawal = async (amount, method) => {
  const response = await api.post('/instructor/withdraw', { amount, paymentMethod: method });
  return response.data;
};

// ── REVIEWS ──────────────────────────────────────────────────────────────────
export const getReviewData = async () => {
  const response = await api.get('/instructor/reviews');
  return response.data;
};

export const replyToReview = async (courseId, reviewId, reply) => {
  const response = await api.put(`/courses/${courseId}/reviews/${reviewId}/reply`, { reply });
  return response.data;
};

export const reportReview = async (courseId, reviewId, reportReason) => {
  const response = await api.post(`/courses/${courseId}/reviews/${reviewId}/report`, { reportReason });
  return response.data;
};

// ── SETTINGS ─────────────────────────────────────────────────────────────────
export const updateSettings = async (data) => {
  const response = await api.put('/instructor/profile', data);
  return response.data;
};

export const getSettings = async () => {
  const response = await api.get('/instructor/settings');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/instructor/profile', data);
  return response.data;
};

export const updateAvatar = async (formData) => {
  const response = await api.put('/instructor/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/instructor/change-password', data);
  return response.data;
};

export const requestEmailChange = async (newEmail) => {
  const response = await api.post('/instructor/request-email-change', { newEmail });
  return response.data;
};

export const verifyEmailOtp = async (otp) => {
  const response = await api.post('/instructor/verify-email-otp', { otp });
  return response.data;
};

export const logoutAllDevices = async () => {
  const response = await api.post('/instructor/logout-all');
  return response.data;
};

// ── HELP CENTER ──────────────────────────────────────────────────────────────
export const submitTicket = async (data) => {
  const response = await api.post('/instructor/support/tickets', data);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/instructor/support/tickets');
  return response.data;
};
