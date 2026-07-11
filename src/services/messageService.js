import api from './api';

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getEligibleContacts = async () => {
  const response = await api.get('/messages/eligible-contacts');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const broadcastMessage = async (data) => {
  const response = await api.post('/messages/broadcast', data);
  return response.data;
};

export const markAsRead = async (conversationId) => {
  const response = await api.put(`/messages/${conversationId}/read`);
  return response.data;
};

export const uploadMessageFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'zinda-learn/messages');
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
