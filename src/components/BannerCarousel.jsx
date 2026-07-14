import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { getActiveBanners } from '../services/bannerService';

const AUTOPLAY_MS = 6000;

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data.data || []);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const goTo = useCallback((i) => {
    const len = banners.length;
    setIndex(len ? ((i % len) + len) % len : 0);
  }, [banners.length]);

  // Clamp to a valid slide whenever the list changes (e.g. fewer banners than before).
  const safeIndex = banners.length ? index % banners.length : 0;

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(() => goTo(safeIndex + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [safeIndex, isHovered, banners.length, goTo]);

  if (banners.length === 0) return null;

  const banner = banners[safeIndex];

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-sm border border-slate-100 h-56 sm:h-64 lg:h-72 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={banner._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-1.5 drop-shadow-md max-w-xl">{banner.title}</h3>
            <p className="text-sm text-white/85 max-w-lg mb-4 line-clamp-2">{banner.description}</p>
            {banner.linkUrl && (
              <a
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 w-fit px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Learn More <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo(safeIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goTo(safeIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b._id}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
