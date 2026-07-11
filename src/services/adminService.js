import api from './api';

export const getAllCourses = async (params) => {
  const { data } = await api.get('/admin/courses', { params });
  return data;
};

export const getPendingCourses = async () => {
  const { data } = await api.get('/admin/courses/pending');
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/admin/courses/${id}`);
  return data;
};

export const approveCourse = async (id) => {
  const { data } = await api.patch(`/admin/courses/${id}/approve`);
  return data;
};

export const declineCourse = async (id, declineReason) => {
  const { data } = await api.patch(`/admin/courses/${id}/decline`, { declineReason });
  return data;
};

export const updateCourseStatus = async (id, status) => {
  const { data } = await api.patch(`/admin/courses/${id}/status`, { status });
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const getStudents = async (params) => {
  const { data } = await api.get('/admin/students', { params });
  return data;
};

export const getStudentStats = async () => {
  const { data } = await api.get('/admin/students/stats');
  return data;
};

export const getTutors = async (params) => {
  const { data } = await api.get('/admin/tutors', { params });
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/admin/users', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/admin/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/delete`);
  return data;
};

export const restoreUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/restore`);
  return data;
};

export const blockUser = async (id, blockedReason) => {
  const { data } = await api.patch(`/admin/users/${id}/block`, { blockedReason });
  return data;
};

export const unblockUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/unblock`);
  return data;
};

export const blockCourse = async (id, blockedReason) => {
  const { data } = await api.patch(`/admin/courses/${id}/block`, { blockedReason });
  return data;
};

export const unblockCourse = async (id) => {
  const { data } = await api.patch(`/admin/courses/${id}/unblock`);
  return data;
};

export const getPendingInstructors = async () => {
  const { data } = await api.get('/admin/instructors/pending');
  return data;
};

export const approveInstructor = async (id) => {
  const { data } = await api.put(`/admin/instructor/${id}/approve`);
  return data;
};

export const rejectInstructor = async (id) => {
  const { data } = await api.delete(`/admin/instructor/${id}`);
  return data;
};

export const getPayments = async (params) => {
  const { data } = await api.get('/admin/payments', { params });
  return data;
};

export const getPayouts = async (params) => {
  const { data } = await api.get('/admin/payouts', { params });
  return data;
};

export const updatePayoutStatus = async (id, updateData) => {
  const { data } = await api.patch(`/admin/payouts/${id}/status`, updateData);
  return data;
};

// ── MANUAL ENROLLMENT ────────────────────────────────────────────────────────
export const grantEnrollment = async (studentId, courseId) => {
  const { data } = await api.post('/admin/enrollments/grant', { studentId, courseId });
  return data;
};

export const revokeEnrollment = async (enrollmentId) => {
  const { data } = await api.delete(`/admin/enrollments/${enrollmentId}`);
  return data;
};

export const getEnrollmentHistory = async (params) => {
  const { data } = await api.get('/admin/enrollments', { params });
  return data;
};
