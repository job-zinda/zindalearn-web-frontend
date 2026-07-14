import { useState, useEffect } from 'react';
import { Image, CheckCircle, EyeOff, Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getBanners, createBanner, updateBanner, deleteBanner,
  toggleBannerStatus, reorderBanners,
} from '../../services/bannerService';
import DataTable from '../../components/admin/shared/DataTable';
import AnalyticsCard from '../../components/admin/shared/AnalyticsCard';
import StatusBadge from '../../components/admin/shared/StatusBadge';
import PageHeader from '../../components/admin/shared/PageHeader';
import ConfirmModal from '../../components/admin/shared/ConfirmModal';
import BannerFormModal from '../../components/admin/BannerFormModal';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setBanners(data.data || []);
    } catch {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleAddClick = () => {
    setEditingBanner(null);
    setShowFormModal(true);
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setShowFormModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingBanner) {
        await updateBanner(editingBanner._id, formData);
        toast.success('Banner updated');
      } else {
        await createBanner(formData);
        toast.success('Banner added');
      }
      fetchBanners();
    } catch {
      toast.error('Failed to save banner');
    }
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    try {
      setDeleting(true);
      await deleteBanner(deletingBanner._id);
      toast.success('Banner deleted');
      setDeletingBanner(null);
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleBannerStatus(id);
      fetchBanners();
    } catch {
      toast.error('Failed to update banner status');
    }
  };

  const handleMove = async (banner, direction) => {
    const swapWith = direction === 'up' ? banners[currentIndex(banner) - 1] : banners[currentIndex(banner) + 1];
    if (!swapWith) return;

    const reordered = [...banners];
    const a = currentIndex(banner);
    const b = currentIndex(swapWith);
    [reordered[a], reordered[b]] = [reordered[b], reordered[a]];
    setBanners(reordered);

    try {
      await reorderBanners(reordered.map((b) => b._id));
    } catch {
      toast.error('Failed to reorder banners');
      fetchBanners();
    }
  };

  const currentIndex = (banner) => banners.findIndex((b) => b._id === banner._id);

  const columns = [
    {
      header: 'Banner',
      cell: (banner) => (
        <div className="flex items-center gap-3">
          <div className="w-20 h-11 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
            <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 line-clamp-1 max-w-[220px]">{banner.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-[220px]">{banner.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Link',
      cell: (banner) =>
        banner.linkUrl ? (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors max-w-[160px] truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {banner.linkUrl}
          </a>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Status',
      cell: (banner) => <StatusBadge status={banner.isActive ? 'active' : 'inactive'} />,
    },
    {
      header: 'Order',
      cell: (banner) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMove(banner, 'up')}
            disabled={currentIndex(banner) === 0}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Move up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleMove(banner, 'down')}
            disabled={currentIndex(banner) === banners.length - 1}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Move down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (banner) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleToggleStatus(banner._id)}
            className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${banner.isActive ? 'text-amber-400' : 'text-emerald-400'}`}
            title={banner.isActive ? 'Hide' : 'Show'}
          >
            {banner.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleEditClick(banner)}
            className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingBanner(banner)}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Banners" subtitle="Manage promotional banners shown on the student and instructor dashboards.">
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Banner
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalyticsCard title="Total Banners" value={banners.length} icon={Image} color="indigo" />
        <AnalyticsCard title="Active" value={banners.filter((b) => b.isActive).length} icon={CheckCircle} color="emerald" />
        <AnalyticsCard title="Hidden" value={banners.filter((b) => !b.isActive).length} icon={EyeOff} color="amber" />
      </div>

      <DataTable
        columns={columns}
        data={banners}
        loading={loading}
        emptyMessage="No banners yet"
        emptyDescription="Add a banner to promote offers or announcements to students and instructors."
      />

      <BannerFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingBanner(null); }}
        onSave={handleSave}
        banner={editingBanner}
      />

      <ConfirmModal
        isOpen={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Banner"
        description={`"${deletingBanner?.title}" will be permanently removed and no longer shown to students or instructors.`}
        confirmLabel="Delete Banner"
        loading={deleting}
      />
    </div>
  );
};

export default BannerManagement;
