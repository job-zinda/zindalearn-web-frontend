import React from 'react';
import VideoPlayer from '../../components/VideoPlayer';

const VideoTest = () => {
  const testCases = [
    {
      title: 'YouTube Video',
      videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      source: 'youtube',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Vimeo Video',
      videoUrl: 'https://vimeo.com/76979871',
      source: 'vimeo',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Direct Upload (Cloudinary/S3)',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      source: 'upload',
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Invalid URL (Error State)',
      videoUrl: 'https://invalid-url.com/video.mp4',
      source: 'upload',
      thumbnail: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Video Player Test Suite
          </h1>
          <p className="text-slate-400">Testing different video sources and states for the VideoPlayer component.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testCases.map((test, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-200">{test.title}</h2>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-purple-400 uppercase">
                  {test.source}
                </span>
              </div>
              
              <VideoPlayer 
                videoUrl={test.videoUrl}
                source={test.source}
                thumbnail={test.thumbnail}
                title={test.title}
              />
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <p className="text-xs text-slate-500 font-mono break-all">
                  URL: {test.videoUrl}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoTest;
