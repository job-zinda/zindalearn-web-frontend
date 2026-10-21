import { Link } from 'react-router-dom';
import { Clock3, GraduationCap } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';

const InstructorComingSoon = () => (
  <div className="min-h-screen bg-surface-50">
    <Navbar showBackground />
    <main className="flex min-h-[70vh] items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-xl rounded-3xl border border-surface-100 bg-white p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          <Clock3 className="h-4 w-4" />
          Available soon
        </div>
        <h1 className="mb-3 text-3xl font-bold text-surface-900">Teach on Zinda Learn</h1>
        <p className="mb-8 text-surface-500">
          Instructor login and registration are coming soon. You can explore our courses in the meantime.
        </p>
        <Link to="/courses">
          <Button>Explore Courses</Button>
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default InstructorComingSoon;
