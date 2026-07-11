import api from './api';

export const getLandingStats = async () => {
  const { data } = await api.get('/public/stats');
  return data;
};

export const getLandingTestimonials = async () => {
  const { data } = await api.get('/public/testimonials');
  return data;
};

export const getLandingCategories = async () => {
  const { data } = await api.get('/public/categories');
  return data;
};
