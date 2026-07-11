import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'Do I need prior experience to join a course?',
        a: "No. Each course page lists its prerequisites clearly. Many of our courses are designed for absolute beginners and include all the foundational material you need.",
      },
      {
        q: 'How do I create an account?',
        a: "Click 'Get Started' on the homepage, enter your name, email, and password, or continue with Google. You'll receive a verification email — click the link and you're in.",
      },
      {
        q: 'Is Zinda Learn free to use?',
        a: "Creating an account is free. Individual courses are priced per course. There are no subscription fees — you pay once per course and keep lifetime access.",
      },
      {
        q: 'What languages are the courses available in?',
        a: "Most courses are currently available in English and Urdu/Hindi. We are actively expanding our language offerings.",
      },
    ],
  },
  {
    category: 'Courses & Learning',
    items: [
      {
        q: 'Can I download course videos for offline viewing?',
        a: "Video downloads are not currently supported. You can stream all content through any modern browser on your device with a stable internet connection.",
      },
      {
        q: 'How do I track my learning progress?',
        a: "Your dashboard shows completion percentages, lesson history, quiz scores, and overall progress for each enrolled course.",
      },
      {
        q: 'What happens when I complete a course?',
        a: "Upon completing all lessons and meeting the completion threshold, a downloadable certificate is automatically generated and available in your Certificates section.",
      },
      {
        q: 'Can I access a course from multiple devices?',
        a: "Yes. Your account syncs across all devices. Simply log in from any browser and pick up exactly where you left off.",
      },
    ],
  },
  {
    category: 'Payments & Billing',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and wallets via Razorpay — India's leading payment gateway.",
      },
      {
        q: 'Is my payment information secure?',
        a: "All payments are processed through Razorpay with PCI-DSS Level 1 compliance. Zinda Learn never stores your card information.",
      },
      {
        q: 'Will I receive an invoice after purchase?',
        a: "Yes. A receipt is sent to your registered email immediately after a successful payment.",
      },
      {
        q: 'Do you offer student or group discounts?',
        a: "We periodically run promotions. For bulk or institutional purchases (10+ seats), contact us at support@zindalearn.com for a custom quote.",
      },
    ],
  },
  {
    category: 'Live Classes',
    items: [
      {
        q: 'How do I join a live class?',
        a: "Navigate to Live Classes in your dashboard. The 'Join' button becomes active 10 minutes before the scheduled start time. Click it to open the meeting link.",
      },
      {
        q: 'What if I miss a live class?',
        a: "Attendance is tracked. If recordings are available, your instructor will make them accessible from the course dashboard after the session ends.",
      },
      {
        q: 'What are the technical requirements for live classes?',
        a: "A stable internet connection (minimum 2 Mbps), a modern browser (Chrome or Firefox recommended), and speakers or headphones.",
      },
    ],
  },
];

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-surface-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-surface-50 transition-colors"
      >
        <span className="text-sm font-semibold text-surface-900">{q}</span>
        <ChevronDown
          size={16}
          className={`text-surface-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white border-t border-surface-50">
          <p className="text-sm text-surface-600 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQsPage = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');

  const categories = FAQS.map((f) => f.category);
  const currentFAQs = FAQS.find((f) => f.category === activeCategory)?.items || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar showBackground />

      {/* Header */}
      <section className="bg-surface-900 pt-28 pb-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            FAQs
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-surface-400 text-sm leading-relaxed">
            Quick answers to the questions we hear most often. Can't find what you need?{' '}
            <a href="mailto:support@zindalearn.com" className="text-primary-400 hover:underline">
              Email our team.
            </a>
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-9">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {currentFAQs.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-surface-50 rounded-2xl border border-surface-100">
          <h3 className="text-base font-bold text-surface-900 mb-2">Still have questions?</h3>
          <p className="text-sm text-surface-500 mb-5 max-w-sm mx-auto leading-relaxed">
            Our support team is happy to help. Reach out and we'll get back to you within a few hours.
          </p>
          <a
            href="mailto:support@zindalearn.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQsPage;
