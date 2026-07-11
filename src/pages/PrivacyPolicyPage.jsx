import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LAST_UPDATED = 'May 15, 2025';

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you register for an account, enroll in a course, make a purchase, or contact us for support.

**Account information:** Name, email address, password (hashed), and profile photo.

**Payment information:** We use Razorpay to process payments. We do not store your full card number, CVV, or banking credentials. Razorpay stores this data under PCI-DSS Level 1 compliance. We retain transaction IDs and billing amounts for our records.

**Learning data:** Course progress, quiz answers, completion status, certificates issued, and live class attendance.

**Device and usage data:** Browser type, operating system, IP address, pages visited, time spent on lessons, and error logs. This data helps us improve platform reliability and personalize your experience.`,
  },
  {
    id: 'how-we-use-information',
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

- Provide, maintain, and improve the Zinda Learn platform
- Process your enrollment and payments
- Send you course updates, receipts, and platform announcements
- Respond to your support requests
- Generate and issue completion certificates
- Analyze aggregate usage trends to improve content quality
- Detect and prevent fraudulent activity

We do not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
  },
  {
    id: 'data-sharing',
    title: '3. Data Sharing and Disclosure',
    content: `We share your data only in the following limited circumstances:

**With instructors:** Instructors can see the names and progress of students enrolled in their courses. They cannot see your payment details, password, or private account settings.

**With service providers:** We use trusted third-party services including Razorpay (payments), Cloudinary (media hosting), MongoDB Atlas (database), and Firebase (authentication). These providers process data on our behalf under strict data processing agreements.

**For legal compliance:** We may disclose your information if required by law, court order, or to protect the rights, property, or safety of Zinda Learn, our users, or the public.

**Business transfers:** In the event of a merger, acquisition, or sale of company assets, your data may be transferred as part of that transaction. We will notify you before your information is subject to a different privacy policy.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies and Tracking',
    content: `We use cookies and similar technologies to:

- Keep you logged into your account across sessions
- Remember your preferences and settings
- Analyze how the platform is used (aggregate, anonymized data)

You can configure your browser to reject cookies, but some features of the platform may not function correctly without them. We do not use third-party advertising cookies.`,
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: `We retain your account data for as long as your account is active or as necessary to provide services. If you delete your account, we remove your personal information within 30 days, except where we are required to retain it for legal or accounting purposes (e.g., transaction records for up to 7 years under Indian GST law).

Course completion records and certificates may be retained for verification purposes even after account deletion.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: `You have the right to:

- **Access** the personal information we hold about you
- **Correct** inaccurate or incomplete data via your account settings
- **Delete** your account and associated personal data
- **Withdraw consent** for optional data processing at any time
- **Export** a copy of your data by contacting support@zindalearn.com

To exercise any of these rights, email us at support@zindalearn.com. We will respond within 30 days.`,
  },
  {
    id: 'security',
    title: '7. Security',
    content: `We implement industry-standard security measures including TLS/HTTPS encryption in transit, hashed and salted passwords (bcrypt), role-based access controls, and regular security audits.

No system is completely secure. While we work hard to protect your data, we cannot guarantee absolute security. We encourage you to use a strong, unique password and to enable two-factor authentication when available.

If you believe your account has been compromised, contact us immediately at support@zindalearn.com.`,
  },
  {
    id: 'childrens-privacy',
    title: "8. Children's Privacy",
    content: `Zinda Learn is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such data, we will delete it promptly.

Users between 13 and 18 years of age should have parental consent before registering.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by displaying a prominent notice on the platform at least 7 days before the change takes effect.

Your continued use of Zinda Learn after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

**Email:** support@zindalearn.com
**Phone:** +91 85906 98873
**Address:** Tech Park, Palakkad, Kerala, India — 678001

We aim to respond to all privacy-related inquiries within 5 business days.`,
  },
];

/* Renders markdown-style bold (**text**) as <strong> */
const RichText = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-surface-800">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const PrivacyPolicyPage = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar showBackground />

      {/* Header */}
      <section className="bg-surface-900 pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-surface-400 text-sm">
            Last updated: <span className="text-surface-300">{LAST_UPDATED}</span>
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex gap-12 items-start">

          {/* Sticky TOC — desktop only */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24 self-start">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-4">Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block text-xs py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                    activeId === s.id
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                  }`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-500 leading-relaxed mb-10 pb-8 border-b border-surface-100">
              Your privacy matters to us. This policy explains what data Zinda Learn collects, how we use it, and what choices you have. Please read it carefully.
            </p>

            <div className="space-y-12">
              {SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-base font-bold text-surface-900 mb-4">{s.title}</h2>
                  <div className="space-y-3">
                    {s.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm text-surface-600 leading-relaxed">
                        {para.startsWith('- ') ? (
                          <ul className="space-y-1.5 list-none">
                            {para.split('\n').map((line, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                                <RichText text={line.replace(/^- /, '')} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <RichText text={para} />
                        )}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
