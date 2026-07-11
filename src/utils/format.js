export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const CATEGORY_DISPLAY_MAPPING = {
  development: 'Development',
  business: 'Business',
  marketing: 'Marketing',
  design: 'Design',
  finance: 'Finance',
  it: 'IT & Software'
};

export const formatCategory = (category) => {
  if (!category) return '';
  const key = String(category).toLowerCase().trim();
  return CATEGORY_DISPLAY_MAPPING[key] || category;
};
