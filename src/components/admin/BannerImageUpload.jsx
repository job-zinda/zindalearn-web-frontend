import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadBannerImage } from '../../services/bannerService';

const BannerImageUpload = ({ initialUrl, onUploadSuccess, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || '');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error('Please upload a valid image file (JPG, PNG, or WEBP)');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return toast.error('Image size must be less than 5MB');
    }

    try {
      setUploading(true);
      const response = await uploadBannerImage(file);
      setPreviewUrl(response.url);
      onUploadSuccess(response.url);
      toast.success('Banner image uploaded successfully!');
    } catch (error) {
      console.error('Banner image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload banner image');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onRemove();
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Banner Image</label>

      {previewUrl ? (
        <div className="relative group rounded-2xl overflow-hidden shadow-xl aspect-[21/9] border border-slate-700/60">
          <img src={previewUrl} alt="Banner preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <div {...getRootProps()} className="p-3 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700">
              <input {...getInputProps()} />
              <UploadCloud className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-3 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-3 h-3" />
            READY
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative aspect-[21/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-6 cursor-pointer ${
            isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/40'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Uploading Image...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-indigo-500/10">
                <ImageIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold mb-1 text-slate-300">
                {isDragActive ? 'Drop it here!' : 'Click or drag banner image'}
              </h4>
              <p className="text-[11px] text-slate-500">Recommended 1600×686 (21:9) • JPG, PNG or WEBP • Max 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BannerImageUpload;
