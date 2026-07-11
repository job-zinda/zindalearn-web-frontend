import api from './api';
import axios from 'axios';

export const videoService = {
  getSignature: async (courseId) => {
    const response = await api.post('/videos/signature', { courseId });
    return response.data;
  },

  saveVideoMetadata: async (data) => {
    const response = await api.post('/videos', data);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  getCourseVideos: async (courseId) => {
    const response = await api.get(`/videos/course/${courseId}`);
    return response.data;
  },

  /**
   * Upload video to backend proxy which then uploads to Cloudinary
   */
  uploadVideo: async (file, courseId, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('courseId', courseId);

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  }
};
