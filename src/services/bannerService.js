import api from './api';

export const getBanners = async (params) => {
  const { data } = await api.get('/admin/banners', { params });
  return data;
};

export const getActiveBanners = async () => {
  const { data } = await api.get('/public/banners');
  return data;
};

export const createBanner = async (bannerData) => {
  const { data } = await api.post('/admin/banners', bannerData);
  return data;
};

export const updateBanner = async (id, bannerData) => {
  const { data } = await api.put(`/admin/banners/${id}`, bannerData);
  return data;
};

export const deleteBanner = async (id) => {
  const { data } = await api.delete(`/admin/banners/${id}`);
  return data;
};

export const toggleBannerStatus = async (id) => {
  const { data } = await api.patch(`/admin/banners/${id}/toggle-status`);
  return data;
};

export const reorderBanners = async (orderedIds) => {
  const { data } = await api.patch('/admin/banners/reorder', { orderedIds });
  return data;
};

export const uploadBannerImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'zinda-learn/banners');
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
