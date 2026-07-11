import api from './api';

export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllRead = async () => {
  const { data } = await api.patch('/notifications/mark-all-read');
  return data;
};
