import api from '../../../services/api';

const liveClassService = {
  // Instructor APIs
  createLiveClass: async (data) => {
    const response = await api.post('/live-classes', data);
    return response.data;
  },

  updateLiveClass: async (id, data) => {
    const response = await api.put(`/live-classes/${id}`, data);
    return response.data;
  },

  deleteLiveClass: async (id) => {
    const response = await api.delete(`/live-classes/${id}`);
    return response.data;
  },

  startLiveClass: async (id) => {
    const response = await api.patch(`/live-classes/${id}/start`);
    return response.data;
  },

  endLiveClass: async (id) => {
    const response = await api.patch(`/live-classes/${id}/end`);
    return response.data;
  },

  getInstructorLiveClasses: async () => {
    const response = await api.get('/live-classes/instructor/all');
    return response.data;
  },

  // Student APIs
  getStudentLiveClasses: async () => {
    const response = await api.get('/live-classes/student');
    return response.data;
  },

  getLiveClassById: async (id) => {
    const response = await api.get(`/live-classes/${id}`);
    return response.data;
  },

  joinLiveClass: async (id) => {
    const response = await api.post(`/live-classes/${id}/join`);
    return response.data;
  }
};

export default liveClassService;
