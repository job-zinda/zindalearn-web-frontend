import api from './api';

export const createCourse = async (courseData) => {
  const { data } = await api.post('/instructor/course', courseData);
  return data;
};

export const getInstructorCourses = async (params = {}) => {
  const { data } = await api.get('/instructor/my-courses', { params });
  return data;
};

export const updateCourse = async (id, courseData) => {
  const { data } = await api.put(`/instructor/course/${id}`, courseData);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/instructor/course/${id}`);
  return data;
};

export const getInstructorStats = async () => {
  const { data } = await api.get('/instructor/stats');
  return data;
};

export const submitCourse = async (id) => {
  const { data } = await api.patch(`/courses/${id}/submit`);
  return data;
};

export const getInstructorStudents = async () => {
  const { data } = await api.get('/instructor/students');
  return data;
};

export const uploadThumbnail = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'zinda-learn/courses/thumbnails');
  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
