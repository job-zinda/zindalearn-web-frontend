import { CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LAST_UPDATED = 'May 15, 2025';

const ELIGIBLE = [
  'The course was purchased within the last 7 days',
  'You have completed less than 20% of the course content',
  'The course content is materially different from its description',
  'A confirmed technical issue prevented you from accessing the course',
];

const NOT_ELIGIBLE = [
  'More than 7 days have passed since purchase',
  'You have completed 20% or more of the course content',
  'You simply changed your mind after completing a significant portion',
  'The refund is requested for a course purchased during a sale or promotion (unless defective)',
  'Live class sessions that have already been conducted',
];

const STEPS = [
  {
    step: '01',
    title: 'Submit a request',
    desc: 'Email support@zindalearn.com with your registered email, order ID, and reason for the refund.',
  },
  {
    step: '02',
    title: 'We review your request',
    desc: 'Our team reviews your request within 2 business days and verifies eligibility.',
  },
  {
    step: '03',
    title: 'Approval notification',
    desc: 'You will receive an email confirming approval or explaining why your request was declined.',
  },
  {
    step: '04',
    title: 'Refund processed',
    desc: 'Approved refunds are returned to your original payment method within 5–7 business days.',
  },
];

const RefundPolicyPage = () => (
  <div className="min-h-screen bg-white">
    <Navbar showBackground />

    {/* Header */}
    <section className="bg-surface-900 pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
          Refund Policy
        </h1>
        <p className="text-surface-400 text-sm">
          Last updated: <span className="text-surface-300">{LAST_UPDATED}</span>
        </p>
      </div>
    </section>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">

      {/* Overview */}
      <section>
        <p className="text-sm text-surface-600 leading-relaxed max-w-2xl">
          We want you to be completely satisfied with your learning experience on Zinda Learn. If a course does not meet your expectations, we offer a straightforward refund process subject to the conditions below.
        </p>
      </section>

      {/* 7-day guarantee highlight */}
      <section className="bg-primary-50 border border-primary-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Clock size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-surface-900 mb-2">7-Day Money-Back Guarantee</h2>
          <p className="text-sm text-surface-600 leading-relaxed">
            If you are unsatisfied with a course for any valid reason, you may request a full refund within <strong className="text-surface-800">7 days of purchase</strong>, provided you have completed less than 20% of the course. This guarantee exists to give you confidence in every purchase.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section>
        <h2 className="text-base font-bold text-surface-900 mb-6">Refund Eligibility</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Eligible */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h3 className="text-sm font-semibold text-emerald-800">Eligible for refund</h3>
            </div>
            <ul className="space-y-3">
              {ELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-xs text-emerald-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not eligible */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={16} className="text-rose-600" />
              <h3 className="text-sm font-semibold text-rose-800">Not eligible for refund</h3>
            </div>
            <ul className="space-y-3">
              {NOT_ELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span className="text-xs text-rose-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section>
        <h2 className="text-base font-bold text-surface-900 mb-6">How to Request a Refund</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="bg-white border border-surface-100 rounded-xl p-5">
              <div className="text-2xl font-bold text-primary-200 font-display mb-3">{s.step}</div>
              <h3 className="text-sm font-semibold text-surface-900 mb-2">{s.title}</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-surface-50 border border-surface-100 rounded-2xl p-6 md:p-8">
        <h2 className="text-base font-bold text-surface-900 mb-5">Refund Timelines</h2>
        <div className="space-y-3">
          {[
            { label: 'Request review', value: 'Within 2 business days' },
            { label: 'Approval notification', value: 'Within 3 business days of request' },
            { label: 'Refund to original payment method', value: '5–7 business days after approval' },
            { label: 'Razorpay processing time', value: 'May add 2–3 additional days depending on your bank' },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 text-sm py-2.5 border-b border-surface-100 last:border-0">
              <span className="text-surface-600 font-medium">{row.label}</span>
              <span className="text-surface-900 font-semibold text-right flex-shrink-0">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Special cases */}
      <section>
        <h2 className="text-base font-bold text-surface-900 mb-4">Special Cases</h2>
        <div className="space-y-4 text-sm text-surface-600 leading-relaxed">
          <p>
            <strong className="text-surface-800">Technical failures:</strong> If a documented platform issue prevented you from accessing paid content, you are entitled to a full refund regardless of the 7-day or 20% completion thresholds. Contact us with details of the issue.
          </p>
          <p>
            <strong className="text-surface-800">Duplicate purchases:</strong> If you accidentally purchased the same course twice, contact us immediately. We will refund the duplicate charge in full.
          </p>
          <p>
            <strong className="text-surface-800">Course removed by instructor:</strong> If an instructor removes a course you purchased and no equivalent replacement is offered, you will receive a full refund.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-surface-900 rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-white mb-1.5">Have a refund request?</h3>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
            Email us at support@zindalearn.com with your registered email address and order ID.
          </p>
        </div>
        <a
          href="mailto:support@zindalearn.com"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors flex-shrink-0"
        >
          <Mail size={15} /> Email Support
        </a>
      </section>
    </div>

    <Footer />
  </div>
);

export default RefundPolicyPage;
