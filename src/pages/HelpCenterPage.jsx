import { Link } from 'react-router-dom';
import {
  MessageCircle, BookOpen, CreditCard, Shield, Video,
  Mail, Phone, ChevronRight, Search, Zap, Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORIES = [
  {
    icon: BookOpen,
    color: 'bg-violet-50 text-violet-600',
    title: 'Getting Started',
    desc: 'Account setup, enrollment, and first steps on the platform.',
    articles: 12,
    href: '#getting-started',
  },
  {
    icon: Video,
    color: 'bg-blue-50 text-blue-600',
    title: 'Courses & Learning',
    desc: 'How to watch, progress, download, and complete your courses.',
    articles: 18,
    href: '#courses',
  },
  {
    icon: CreditCard,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Payments & Billing',
    desc: 'Purchase, invoices, refunds, and subscription management.',
    articles: 9,
    href: '#billing',
  },
  {
    icon: Shield,
    color: 'bg-amber-50 text-amber-600',
    title: 'Account & Security',
    desc: 'Password, two-factor auth, privacy settings, and account safety.',
    articles: 7,
    href: '#account',
  },
  {
    icon: Zap,
    color: 'bg-rose-50 text-rose-600',
    title: 'Live Classes',
    desc: 'Joining sessions, technical requirements, and recordings.',
    articles: 6,
    href: '#live-classes',
  },
  {
    icon: MessageCircle,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Certificates',
    desc: 'Earning, downloading, and verifying your certificates.',
    articles: 5,
    href: '#certificates',
  },
];

const COMMON_QUESTIONS = [
  {
    q: 'How do I enroll in a course?',
    a: 'Browse our course catalog, click on a course you\'re interested in, and click "Enroll Now". Complete payment and you\'ll have instant access.',
  },
  {
    q: 'Can I access courses on mobile?',
    a: 'Yes. Zinda Learn is fully responsive and works on all devices — phones, tablets, and desktop browsers.',
  },
  {
    q: 'What happens if a live class is missed?',
    a: 'Live sessions are recorded when possible. Check your course dashboard for available recordings after each session.',
  },
  {
    q: 'How long do I have access after enrolling?',
    a: 'You get lifetime access to all enrolled courses, including any future updates the instructor adds.',
  },
];

const HelpCenterPage = () => (
  <div className="min-h-screen bg-white">
    <Navbar showBackground />

    {/* Hero */}
    <section className="bg-surface-900 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          Support
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
          How can we help you?
        </h1>
        <p className="text-surface-400 mb-8 text-sm leading-relaxed">
          Search our knowledge base or browse categories below.
        </p>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search for articles, guides, and FAQs…"
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          />
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-lg font-bold text-surface-900 mb-7">Browse by topic</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.title}
            href={cat.href}
            className="group flex items-start gap-4 p-5 bg-white border border-surface-100 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center flex-shrink-0`}>
              <cat.icon size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors mb-1">
                {cat.title}
              </h3>
              <p className="text-xs text-surface-500 leading-relaxed mb-2">{cat.desc}</p>
              <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                {cat.articles} articles
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>

    {/* Common questions */}
    <section className="bg-surface-50 py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-lg font-bold text-surface-900 mb-7">Common questions</h2>
        <div className="space-y-3">
          {COMMON_QUESTIONS.map((item) => (
            <div key={item.q} className="bg-white border border-surface-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-2">{item.q}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/faqs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            View all FAQs <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>

    {/* Contact */}
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-surface-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Still need help?</h2>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
            Our support team is available Monday–Saturday, 9 AM – 6 PM IST. We typically respond within 4 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <a
            href="mailto:support@zindalearn.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Mail size={15} /> Email Support
          </a>
          <a
            href="tel:+918590698873"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-800 text-white text-sm font-semibold rounded-xl hover:bg-surface-700 transition-colors"
          >
            <Phone size={15} /> Call Us
          </a>
        </div>
      </div>

      {/* Response time strip */}
      <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-surface-500">
        {[
          { icon: Clock, label: 'Avg. response time: 4 hours' },
          { icon: Mail, label: 'support@zindalearn.com' },
          { icon: Phone, label: '+91 85906 98873' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon size={14} className="text-primary-500" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>

    <Footer />
  </div>
);

export default HelpCenterPage;
