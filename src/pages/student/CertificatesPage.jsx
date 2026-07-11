import { useState, useEffect } from 'react';
import { 
  Award, CheckCircle, BookOpen, Share2, Download, 
  Eye, Plus, Star, ShieldCheck,
  ChevronRight, Calendar
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getCertificateStats, 
  getCertificates, 
  getFeaturedCertificate, 
  getSkillsAcquired 
} from '../../services/certificateService';
import { generateCertificatePDF } from '../../features/certificates/utils/pdfGenerator';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CertificatesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [skills, setSkills] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, certsRes, featuredRes, skillsRes] = await Promise.all([
          getCertificateStats(),
          getCertificates(),
          getFeaturedCertificate(),
          getSkillsAcquired()
        ]);
        setStats(statsRes.data);
        setCertificates(certsRes.data);
        setFeatured(featuredRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (cert, elementId) => {
    setDownloading(true);
    toast.loading('Generating your certificate...', { id: 'download' });
    try {
      await generateCertificatePDF(elementId, `${cert.course?.title || 'Certificate'}_${cert.certificateId}`);
      toast.success('Certificate downloaded!', { id: 'download' });
    } catch (error) {
      toast.error('Download failed', { id: 'download' });
    } finally {
      setDownloading(false);
    }
  };

  const handleShareLinkedIn = (cert) => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/verify/' + cert.certificateId)}`;
    window.open(url, '_blank');
  };

  if (loading) return <Loader fullScreen text="Polishing your achievements..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8"
    >
      {/* 1. HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Your Certificates</h1>
        <p className="text-zinc-500 max-w-2xl font-medium leading-relaxed">
          Celebrate your achievements and showcase your skills to the world. Your journey of excellence is documented here.
        </p>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Certificates Earned', value: stats?.certificatesEarned || 0, icon: Award, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Courses Completed', value: stats?.coursesCompleted || 0, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Skills Acquired', value: stats?.skillsAcquired || 0, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.1em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. FEATURED ACHIEVEMENT */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Featured Achievement</h2>
        </div>
        
        {featured ? (
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden flex flex-col lg:flex-row min-h-[420px]">
            {/* Left: Certificate Preview (Hidden DOM for PDF) */}
            <div className="lg:w-[45%] bg-zinc-900 p-10 flex items-center justify-center relative">
               <div id={`cert-featured-${featured._id}`} className="w-full aspect-[4/3] bg-[#0d1117] p-8 border-[12px] border-[#1f2937] relative shadow-2xl overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-500/30 -translate-x-4 -translate-y-4" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-500/30 translate-x-4 translate-y-4" />
                  
                  <div className="h-full border border-amber-500/20 p-6 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                    <ShieldCheck className="w-12 h-12 text-amber-500 mb-2 opacity-80" />
                    <h3 className="text-amber-500 font-serif text-sm tracking-[0.2em] uppercase opacity-70">Official Certificate</h3>
                    <div className="w-full">
                       <h4 className="text-white text-2xl font-black tracking-tight mb-1">{featured.course?.title}</h4>
                       <div className="h-0.5 w-12 bg-amber-500 mx-auto rounded-full" />
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed max-w-[200px] font-medium italic">
                      This certifies that {user?.name || 'Student'} has successfully mastered the principles of digital architecture and human-centric design.
                    </p>
                  </div>
                  
                  {/* Corner Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <img src="/zinda-learn-logo.png" className="h-4 brightness-0 invert opacity-40" alt="" />
                  </div>
               </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center space-y-8">
              <div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
                  Most Prestigious
                </span>
                <h3 className="text-3xl lg:text-4xl font-black text-zinc-900 mt-4 leading-tight">
                  {featured.course?.title} Certificate
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold">
                      {featured.course?.instructor?.avatar ? (
                        <img src={featured.course.instructor.avatar} className="w-full h-full object-cover" />
                      ) : (
                        featured.course?.instructor?.name?.charAt(0)
                      )}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lead Instructor</p>
                      <p className="text-sm font-bold text-zinc-900">Dr. {featured.course?.instructor?.name}</p>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issue Date</p>
                   <p className="text-sm font-bold text-zinc-900">{new Date(featured.issueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID</p>
                   <p className="text-sm font-bold text-zinc-900 uppercase">{featured.certificateId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                 <button 
                  onClick={() => handleDownload(featured, `cert-featured-${featured._id}`)}
                  disabled={downloading}
                  className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-full shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                 >
                   <Download className="w-5 h-5" />
                   Download PDF
                 </button>
                 <button 
                  onClick={() => handleShareLinkedIn(featured)}
                  className="px-8 py-3.5 bg-zinc-100 text-zinc-700 font-bold rounded-full hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center gap-2"
                 >
                   <FaLinkedin className="w-5 h-5 text-[#0077b5]" />
                   Share on LinkedIn
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-20 text-center">
             <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
                <Award className="w-8 h-8" />
             </div>
             <p className="text-zinc-500 font-bold">Your featured achievement will appear here once you complete a course.</p>
          </div>
        )}
      </div>

      {/* 4. RECENT ACQUISITIONS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Acquisitions</h2>
          </div>
          <button className="text-[11px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            View Archive <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {certificates.map((cert, i) => (
              <motion.div 
                key={cert._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/30 group hover:shadow-2xl transition-all duration-300"
              >
                 <div className="aspect-[16/10] bg-zinc-100 rounded-2xl overflow-hidden mb-6 relative border border-zinc-50">
                    <img src={cert.course?.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm">
                       <ShieldCheck className="w-4 h-4 text-primary-500" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 leading-tight mb-1 truncate">{cert.course?.title}</h4>
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                         <span className="flex items-center gap-1.5"><Star className="w-3 h-3" /> {cert.course?.instructor?.name}</span>
                         <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <button 
                        onClick={() => handleDownload(cert, `cert-hidden-${cert._id}`)}
                        className="flex-1 py-3 bg-primary-50 text-primary-600 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                       >
                         Download
                       </button>
                       <button className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-100 transition-colors">
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-100 transition-colors">
                          <Eye className="w-4 h-4" />
                       </button>
                    </div>
                 </div>

                 {/* Hidden DOM for PDF generation (rendered off-screen to support html2canvas calculation) */}
                 <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
                    <div id={`cert-hidden-${cert._id}`} className="w-[800px] h-[600px] bg-white p-20 border-[20px] border-zinc-100 relative">
                       <div className="h-full border-4 border-zinc-200 p-10 flex flex-col items-center justify-center text-center space-y-6">
                          <Award className="w-20 h-20 text-primary-600 mb-4" />
                          <h1 className="text-zinc-400 font-serif text-sm tracking-[0.4em] uppercase">Certificate of Completion</h1>
                          <div className="space-y-2">
                            <p className="text-zinc-500 text-sm italic">This is to certify that</p>
                            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">{user?.name}</h2>
                          </div>
                          <div className="space-y-1">
                            <p className="text-zinc-500 text-sm italic">has successfully completed the course</p>
                            <h3 className="text-2xl font-bold text-primary-600 tracking-tight">{cert.course?.title}</h3>
                          </div>
                          <div className="w-full pt-10 flex items-end justify-between px-10">
                             <div className="text-left">
                                <p className="text-zinc-900 font-bold text-sm">ZL-LEARN OFFICIAL</p>
                                <p className="text-zinc-400 text-[10px]">Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-zinc-900 font-bold text-sm">ID: {cert.certificateId.toUpperCase()}</p>
                                <p className="text-zinc-400 text-[10px]">Verified Achievement</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            ))}

            {/* 5. EMPTY/LOCKED CARD */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]"
            >
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-zinc-300">
                  <Plus className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-black text-zinc-900">Complete Next Course</p>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Unlock your next professional<br/>certificate today.</p>
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 6. VERIFIED EXPERTISE */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-zinc-900 rounded-full" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Verified Expertise
          </h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/30">
          <div className="flex flex-wrap gap-3">
             {skills.length > 0 ? skills.map((skill, i) => (
               <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-2.5 bg-primary-50 text-primary-600 text-xs font-black rounded-full border border-primary-100 hover:bg-primary-600 hover:text-white transition-all cursor-default"
               >
                 • {skill}
               </motion.span>
             )) : (
               <p className="text-zinc-400 text-sm italic">No skills verified yet.</p>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificatesPage;
