import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-white">
      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and transform your career with world-class courses.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-surface-50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-5">
              <img src="/zinda-learn-logo.png" alt="Zinda Learn" className="h-8 object-contain brightness-0 invert" />
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed mb-6">
              Empowering learners worldwide with premium quality courses and a world-class learning experience.
            </p>
            <div className="flex items-center gap-3">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-primary-600 flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Courses</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/help-center" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Help Center</Link></li>
              <li><Link to="/faqs" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">FAQs</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-surface-400">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                support@zindalearn.com
              </li>
              <li className="flex items-center gap-3 text-sm text-surface-400">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                +91 85906 98873
              </li>
              <li className="flex items-start gap-3 text-sm text-surface-400">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                Tech Park, Palakkad, Kerala, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-surface-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} Zinda Learn. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-sm text-surface-500 hover:text-primary-400 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-sm text-surface-500 hover:text-primary-400 transition-colors">Terms</Link>
            <Link to="/refund-policy" className="text-sm text-surface-500 hover:text-primary-400 transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
