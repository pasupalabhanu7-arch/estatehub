import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    /* storage unavailable */
  }
  return config;
});

export const errMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export const formatPrice = (n, listingType) => {
  const s = '₹' + new Intl.NumberFormat('en-IN').format(n || 0);
  return listingType === 'rent' ? s + ' / month' : s;
};

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="32" text-anchor="middle">No image</text></svg>'
  );

export default api;
