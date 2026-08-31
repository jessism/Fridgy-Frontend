// Client for every /api/admin/* endpoint the console talks to (admin-only;
// the backend enforces is_admin on each route).
//
// This is the single place that knows API_BASE_URL and the token convention.
// AuthContext.apiRequest is module-private, so the admin pages route through
// here rather than each rebuilding headers.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? `?${qs}` : '';
};

/**
 * One request helper for the whole admin area.
 *
 * path      — absolute under /api, e.g. '/admin/feedback'
 * params    — query string values (undefined/null/'' dropped)
 * body      — JSON-serialised; sets Content-Type
 * formData  — sent as-is; Content-Type is left to the browser so it can add
 *             the multipart boundary (blog image upload, TikTok photos)
 *
 * Returns body.data for { success, data } envelopes, and the whole body for
 * the older endpoints that don't use one.
 */
export async function adminFetch(path, { method = 'GET', params, body, formData } = {}) {
  const token = localStorage.getItem('fridgy_token');
  const headers = { Authorization: `Bearer ${token}` };
  const init = { method, headers };

  if (formData) {
    init.body = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, init);
  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload.success === false) {
    const err = new Error(payload.error || `Request failed (${res.status})`);
    err.status = res.status;
    // Keep the parsed body on the error: some endpoints return useful fields
    // alongside a failure (e.g. tiktok-upload returns batch_id when the photos
    // were saved but the pipeline dispatch failed).
    err.data = payload;
    throw err;
  }
  return payload.data !== undefined ? payload.data : payload;
}

const adminGet = (path, params = {}) => adminFetch(`/admin/analytics${path}`, { params });

export const fetchOverview = (days) => adminGet('/overview', { days });
export const fetchUsers = ({ search, sort, dir, page, pageSize }) => adminGet('/users', { search, sort, dir, page, pageSize });
export const fetchUserDetail = (id) => adminGet(`/users/${encodeURIComponent(id)}`);

// --- feedback ---
export const FEEDBACK_STATUSES = ['new', 'read', 'resolved'];
export const fetchFeedback = ({ status, page, pageSize } = {}) =>
  adminFetch('/admin/feedback', { params: { status, page, pageSize } });
export const updateFeedback = (id, status) =>
  adminFetch(`/admin/feedback/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });

// --- promo codes ---
export const fetchPromos = () => adminFetch('/admin/promos');
export const createPromo = (payload) => adminFetch('/admin/promos', { method: 'POST', body: payload });
export const updatePromo = (id, payload) =>
  adminFetch(`/admin/promos/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });

// Links to the PostHog dashboards that own behavioural analytics (DAU/MAU,
// retention, feature trends, RevenueCat events). Fill in after creating them
// in PostHog; until then they open the project home.
const POSTHOG_PROJECT = process.env.REACT_APP_POSTHOG_PROJECT_URL || 'https://us.posthog.com';
export const POSTHOG_LINKS = [
  { key: 'product', title: 'Product overview', blurb: 'DAU / WAU / MAU, most-used features (feature_used by feature), screen views, retention.', url: process.env.REACT_APP_POSTHOG_DASHBOARD_PRODUCT || POSTHOG_PROJECT },
  { key: 'revenue', title: 'Revenue', blurb: 'RevenueCat events over time, trial → paid funnel, active subscribers by status.', url: process.env.REACT_APP_POSTHOG_DASHBOARD_REVENUE || POSTHOG_PROJECT },
  { key: 'onboarding', title: 'Onboarding funnel', blurb: 'Welcome → paywall → account creation → tour, from the existing onboarding_* events.', url: process.env.REACT_APP_POSTHOG_DASHBOARD_ONBOARDING || POSTHOG_PROJECT },
];

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
export const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const timeAgo = (iso) => {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};
export const FEATURE_LABELS = {
  inventory: 'Inventory', meal_log: 'Meal log', saved_recipes: 'Recipe library',
  ai_recipes: 'AI recipes', shopping_list: 'Shopping list items', shopping_list_owner: 'Shopping lists created',
  meal_plan: 'Meal plans', cookbook: 'Cookbooks', inventory_usage: 'Inventory usage', streaks: 'Streaks',
  guided_tour: 'Guided tour', push_notifications: 'Push enabled',
};
