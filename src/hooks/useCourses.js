import { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';

export const useCourses = (filters = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses(filters);
      setCourses(data.courses || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For search, we might want to debounce, but we'll handle that in the component
    fetchCourses();
  }, [
    filters.category,
    filters.level,
    filters.search,
    filters.sort,
    filters.page,
    filters.minPrice,
    filters.maxPrice
  ]);

  return { courses, loading, error, pagination, refetch: fetchCourses };
};
