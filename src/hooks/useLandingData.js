import { useState, useEffect } from 'react';
import { getLandingStats, getLandingTestimonials, getLandingCategories } from '../services/publicService';

export const useLandingData = () => {
  const [stats, setStats] = useState({
    students: '0',
    courses: '0',
    instructors: '0',
    avgRating: '4.8'
  });
  const [testimonials, setTestimonials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, testimonialsData, categoriesData] = await Promise.all([
          getLandingStats(),
          getLandingTestimonials(),
          getLandingCategories()
        ]);

        if (statsData.success) {
          setStats({
            students: statsData.data.students >= 1000 ? `${(statsData.data.students / 1000).toFixed(0)}K+` : statsData.data.students,
            courses: `${statsData.data.courses}+`,
            instructors: `${statsData.data.instructors}+`,
            avgRating: statsData.data.avgRating
          });
        }

        if (testimonialsData.success) {
          setTestimonials(testimonialsData.data);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, testimonials, categories, loading, error };
};
