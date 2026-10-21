export const captureReferralFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('ref')) return;
  const code = params.get('ref').trim();
  if (!code || code.length > 100 || [...code].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    throw new Error('The referral link has an invalid Jobzinda referral ID.');
  }
  const course = window.location.pathname.match(/^\/courses\/([^/]+)$/)?.[1];
  sessionStorage.setItem(course ? `zinda_referral:${course}` : 'zinda_referral', code);
};

export const getReferralCode = (courseId) =>
  sessionStorage.getItem(`zinda_referral:${courseId}`) ?? sessionStorage.getItem('zinda_referral') ?? '';

export const saveReferralCode = (courseId, code) => {
  sessionStorage.setItem(`zinda_referral:${courseId}`, code.trim());
};
