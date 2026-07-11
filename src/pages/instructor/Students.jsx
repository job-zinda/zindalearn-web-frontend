import React, { useState, useEffect } from 'react';
import { getInstructorCourses, getInstructorStudents } from '../../services/instructorService';
import { Users, Search, Filter, MoreVertical, BookOpen, CheckCircle2, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Students = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, studentsData] = await Promise.all([
        getInstructorCourses(),
        getInstructorStudents()
      ]);
      setCourses(coursesData.courses || []);
      setStudents(studentsData.students || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudentsCount = courses.reduce((a, c) => a + (c.totalStudents || 0), 0);

  const filteredStudents = students.filter(item =>
    item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-10 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Students</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and monitor students enrolled in your courses.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Students"
          value={loading ? '—' : totalStudentsCount}
          icon={Users}
          color="purple"
        />
        <SummaryCard
          title="Active Courses"
          value={loading ? '—' : courses.length}
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Enrollment</h3>
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Fetching your community...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Course</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((enrollment, idx) => {
                  const status = enrollment.isCompleted
                    ? "Completed"
                    : enrollment.progress > 0
                    ? "In Progress"
                    : "Not Started";

                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={enrollment.student?.avatar || `https://ui-avatars.com/api/?name=${enrollment.student?.name || 'Student'}&background=6366f1&color=fff`}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                            alt=""
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{enrollment.student?.name || "Unknown Student"}</p>
                            <p className="text-[10px] text-slate-400 font-bold tracking-tight flex items-center gap-1">
                              <Mail size={10} /> {enrollment.student?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-slate-600 line-clamp-1">{enrollment.course?.title || "Unknown Course"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="w-32">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-black text-purple-600">{enrollment.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {status === "Completed" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
                          </div>
                        ) : status === "In Progress" ? (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">In Progress</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Not Started</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No students enrolled yet</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Your future community will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 flex items-center gap-5 group hover:border-purple-200 transition-all">
    <div className={`w-14 h-14 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600 flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-950 tracking-tighter">{value}</p>
    </div>
  </div>
);

export default Students;
