import api from './api';

export const getCertificateStats = async () => {
  const response = await api.get('/student/certificates/stats');
  return response.data;
};

export const getCertificates = async () => {
  const response = await api.get('/student/certificates');
  return response.data;
};

export const getFeaturedCertificate = async () => {
  const response = await api.get('/student/certificates/featured');
  return response.data;
};

export const getSkillsAcquired = async () => {
  const response = await api.get('/student/certificates/skills');
  return response.data;
};
