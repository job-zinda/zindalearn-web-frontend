import api from './api';

export const getCourses = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data;
};



export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  // Handle both { success, course } and { success, data: { course } } or { success, data }
  return response.data.course || response.data.data || response.data;
};

export const updateCourse = async (id, courseData) => {
  const response = await api.put(`/courses/${id}`, courseData);
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get('/enrollments');
  return response.data;
};

export const updateProgress = async (enrollmentId, progressData) => {
  const response = await api.put(`/enrollments/${enrollmentId}/progress`, progressData);
  return response.data;
};

export const submitCourse = async (id) => {
  const response = await api.patch(`/courses/${id}/submit`);
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  const response = await api.post('/enrollments/enroll', { courseId });
  return response.data;
};

// ── Curriculum CRUD ─────────────────────────────────────────────────────────

export const addSection = async (courseId, data) => {
  const response = await api.post(`/courses/${courseId}/sections`, data);
  return response.data;
};

export const updateSection = async (courseId, sectionId, data) => {
  const response = await api.put(`/courses/${courseId}/sections/${sectionId}`, data);
  return response.data;
};

export const deleteSection = async (courseId, sectionId) => {
  const response = await api.delete(`/courses/${courseId}/sections/${sectionId}`);
  return response.data;
};

export const addLessonToSection = async (courseId, sectionId, data) => {
  const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons`, data);
  return response.data;
};

export const updateLessonInSection = async (courseId, sectionId, lessonId, data) => {
  const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, data);
  return response.data;
};

export const deleteLessonFromSection = async (courseId, sectionId, lessonId) => {
  const response = await api.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
  return response.data;
};

export const addLessonQA = async (courseId, sectionId, lessonId, qaData) => {
  const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/qa`, qaData);
  return response.data;
};

export const replyOrEditQA = async (courseId, sectionId, lessonId, qaId, replyData) => {
  const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/qa/${qaId}`, replyData);
  return response.data;
};

export const addLessonReview = async (courseId, sectionId, lessonId, reviewData) => {
  const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/reviews`, reviewData);
  return response.data;
};

export const uploadFile = async (formData) => {
  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
