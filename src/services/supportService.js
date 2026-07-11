import api from './api';

// Create a support ticket (for students/instructors)
export const createTicket = async (ticketData) => {
  const response = await api.post('/support/tickets', ticketData);
  return response.data;
};

// Get logged-in user's tickets
export const getMyTickets = async (page = 1, limit = 10) => {
  const response = await api.get(`/support/tickets?page=${page}&limit=${limit}`);
  return response.data;
};

// Get a single support ticket by ID
export const getTicketById = async (id) => {
  const response = await api.get(`/support/tickets/${id}`);
  return response.data;
};

// Add a reply to a ticket
export const replyToTicket = async (id, message) => {
  const response = await api.post(`/support/tickets/${id}/replies`, { message });
  return response.data;
};

// Get all support tickets (Admin only)
export const adminGetAllTickets = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await api.get(`/support/admin/tickets?${queryParams}`);
  return response.data;
};

// Update ticket status or priority (Admin only)
export const adminUpdateTicket = async (id, data) => {
  const response = await api.patch(`/support/admin/tickets/${id}`, data);
  return response.data;
};
