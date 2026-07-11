import api from './api';

export const getProgressOverview = async () => {
  const response = await api.get('/student/progress/overview');
  return response.data;
};

export const getCoursesProgress = async () => {
  const response = await api.get('/student/progress/courses');
  return response.data;
};

export const getProgressAnalytics = async () => {
  const response = await api.get('/student/progress/analytics');
  return response.data;
};

export const getProgressActivity = async () => {
  const response = await api.get('/student/progress/activity');
  return response.data;
};
