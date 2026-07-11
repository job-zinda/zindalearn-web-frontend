import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, FileVideo, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { videoService } from '../../services/videoService';
import { toast } from 'react-hot-toast';

const VideoUpload = ({ courseId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    source: 'upload',
    videoUrl: '' // For external URLs
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setVideoData(prev => ({ ...prev, title: acceptedFiles[0].name.split('.')[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (!file && videoData.source === 'upload') {
      return toast.error('Please select a video file');
    }
    if (!videoData.title.trim()) {
      return toast.error('Please enter a title');
    }
    if (videoData.source !== 'upload' && !videoData.videoUrl.trim()) {
      return toast.error('Please enter a video URL');
    }

    try {
      setUploading(true);
      let finalVideoUrl = videoData.videoUrl;
      let publicId = null;

      if (videoData.source === 'upload') {
        // 1. Upload to Backend (Proxy to Cloudinary)
        const uploadResponse = await videoService.uploadVideo(file, courseId, (percent) => {
          setProgress(percent);
        });

        finalVideoUrl = uploadResponse.url;
        publicId = uploadResponse.publicId;
        if (uploadResponse.duration) {
          // You might want to update videoData with duration if needed
        }
      }

      // 3. Save metadata
      const response = await videoService.saveVideoMetadata({
        ...videoData,
        videoUrl: finalVideoUrl,
        courseId,
        publicId,
        order: 0 // Default order
      });

      toast.success('Video uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess(response.video);
      
      // Reset state
      setFile(null);
      setProgress(0);
      setVideoData({ title: '', description: '', source: 'upload', videoUrl: '' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Add New Lesson</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setVideoData(prev => ({ ...prev, source: 'upload' }))}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${videoData.source === 'upload' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
          >
            Upload
          </button>
          <button 
            onClick={() => setVideoData(prev => ({ ...prev, source: 'youtube' }))}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${videoData.source === 'youtube' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
          >
            YouTube
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lesson Title</label>
          <input 
            type="text"
            value={videoData.title}
            onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
            placeholder="e.g. Introduction to React"
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900 mt-2"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
          <textarea 
            rows="3"
            value={videoData.description}
            onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
            placeholder="What will students learn in this lesson?"
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900 mt-2 resize-none"
          />
        </div>

        {videoData.source === 'upload' ? (
          <div 
            {...getRootProps()} 
            className={`relative border-2 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden ${
              isDragActive ? 'border-purple-400 bg-purple-50' : 'border-slate-100 hover:border-purple-300 hover:bg-slate-50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-center gap-3 text-purple-600">
                  <FileVideo className="w-8 h-8" />
                  <span className="font-bold text-sm truncate max-w-[200px]">{file.name}</span>
                  {!uploading && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Uploading... {progress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-purple-600" />
                </div>
                <p className="font-bold text-slate-700">Drag & drop lecture video or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">MP4, WebM, or MOV (Max 200MB)</p>
              </>
            )}
          </div>
        ) : (
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Video URL (YouTube/Vimeo)</label>
            <input 
              type="text"
              value={videoData.videoUrl}
              onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-slate-900 mt-2"
            />
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Save Lesson
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoUpload;
