import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LAST_UPDATED = 'May 15, 2025';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Zinda Learn platform (zindalearn.vercel.app), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use the platform.

We reserve the right to update these terms at any time. Continued use of the platform after changes are published constitutes acceptance of the revised terms. We will notify registered users of material changes via email.`,
  },
  {
    id: 'accounts',
    title: '2. Account Registration',
    content: `To access paid content and features, you must register for an account. You agree to:

- Provide accurate, current, and complete information during registration
- Maintain the security of your password and account credentials
- Notify us immediately at support@zindalearn.com of any unauthorized access
- Take responsibility for all activities that occur under your account

You may not create accounts for fraudulent purposes, impersonate other individuals, or use automated methods to register accounts.`,
  },
  {
    id: 'courses',
    title: '3. Course Enrollment and Access',
    content: `**Enrollment:** Upon successful payment, you receive a personal, non-transferable license to access the purchased course content for personal educational use.

**Lifetime access:** Unless otherwise specified, you retain access to purchased course content indefinitely, including future updates made by the instructor.

**Instructor-controlled content:** Instructors may update, reorganize, or supplement course material. Zinda Learn is not liable for changes made by instructors to their own course content.

**Account suspension:** If your account is suspended or terminated due to a violation of these terms, access to purchased courses may be revoked without refund.`,
  },
  {
    id: 'payments',
    title: '4. Payments and Pricing',
    content: `All prices are displayed in Indian Rupees (INR) unless otherwise stated. Prices may change at any time, but changes will not affect courses you have already purchased.

Payments are processed through Razorpay. By making a purchase, you agree to Razorpay's Terms of Service. Zinda Learn does not store payment card information.

**GST:** Applicable Goods and Services Tax (GST) will be added to your order total as per Indian tax regulations.

**Promotions:** Discount codes and promotional offers are subject to individual terms and may expire without notice.`,
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property',
    content: `**Platform IP:** The Zinda Learn platform, branding, and proprietary technology are owned by Zinda Learn and protected under applicable copyright and trademark laws.

**Course content:** Courses, videos, slides, and associated materials are owned by the respective instructors who created them. By publishing on Zinda Learn, instructors grant us a non-exclusive license to host and deliver their content to enrolled students.

**Prohibited use:** You may not reproduce, distribute, publicly display, modify, or create derivative works from any platform or course content without explicit written permission from the rights holder.`,
  },
  {
    id: 'conduct',
    title: '6. Acceptable Use',
    content: `You agree not to:

- Share your account credentials or course access with others
- Download, record, or redistribute course videos or materials
- Use the platform for any unlawful purpose
- Harass, abuse, or harm other users or instructors
- Upload or transmit viruses, malware, or harmful code
- Attempt to gain unauthorized access to any part of the platform
- Use automated scripts or bots to access the platform

Violations may result in immediate account termination without refund.`,
  },
  {
    id: 'live-classes',
    title: '7. Live Classes',
    content: `Live class sessions are subject to scheduling by instructors. Zinda Learn does not guarantee that any specific live class will be available at any particular time.

You must be enrolled in the corresponding course to join a live class. Recording or screen-capturing live sessions without the instructor's explicit permission is strictly prohibited.

Disruptive behavior during live sessions may result in removal from the session and suspension of your account.`,
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimers and Limitation of Liability',
    content: `The platform is provided on an "as is" and "as available" basis. We make no warranties regarding uptime, accuracy of course content, or fitness for a particular purpose.

To the maximum extent permitted by law, Zinda Learn shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to loss of profits, data, or goodwill.

Our total liability to you for any claim shall not exceed the amount you paid to Zinda Learn in the 12 months preceding the claim.`,
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `You may terminate your account at any time by contacting support@zindalearn.com or through your account settings.

We reserve the right to suspend or terminate your account at our discretion if you violate these terms. In the event of termination for cause, no refunds will be issued.

Provisions of these terms that by their nature should survive termination (intellectual property, limitation of liability, dispute resolution) will remain in effect.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    content: `These Terms of Service are governed by the laws of India. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Palakkad, Kerala, India.

If you have any questions about these terms, contact us at support@zindalearn.com.`,
  },
];

/* Bold markdown renderer */
const RichText = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-surface-800">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const TermsOfServicePage = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
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

      <section className="bg-surface-900 pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-surface-400 text-sm">
            Last updated: <span className="text-surface-300">{LAST_UPDATED}</span>
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex gap-12 items-start">

          {/* Sticky TOC */}
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
              These Terms of Service govern your use of the Zinda Learn platform. By using Zinda Learn, you agree to these terms. Please read them carefully before enrolling in any course.
            </p>

            <div className="space-y-12">
              {SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-base font-bold text-surface-900 mb-4">{s.title}</h2>
                  <div className="space-y-3">
                    {s.content.split('\n\n').map((para, i) =>
                      para.startsWith('- ') ? (
                        <ul key={i} className="space-y-1.5">
                          {para.split('\n').map((line, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-surface-600 leading-relaxed">
                              <span className="w-1 h-1 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                              <RichText text={line.replace(/^- /, '')} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={i} className="text-sm text-surface-600 leading-relaxed">
                          <RichText text={para} />
                        </p>
                      )
                    )}
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

export default TermsOfServicePage;
