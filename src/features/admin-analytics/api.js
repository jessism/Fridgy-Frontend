// Thin client for /api/admin/analytics (admin-only, backend enforces is_admin).
// Same token convention as BlogAdmin.js.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function adminGet(path, params = {}) {
  const token = localStorage.getItem('fridgy_token');
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
  const res = await fetch(`${API_BASE_URL}/admin/analytics${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body.data;
}

export const fetchOverview = (days) => adminGet('/overview', { days });
export const fetchUsers = ({ search, sort, dir, page, pageSize }) => adminGet('/users', { search, sort, dir, page, pageSize });
export const fetchUserDetail = (id) => adminGet(`/users/${encodeURIComponent(id)}`);

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
  inventory: 'Inventory', meal_log: 'Meal log', recipe_import: 'Recipe import', saved_recipes: 'Saved recipes',
  ai_recipes: 'AI recipes', shopping_list: 'Shopping list items', shopping_list_owner: 'Shopping lists created',
  meal_plan: 'Meal plans', cookbook: 'Cookbooks', inventory_usage: 'Inventory usage', streaks: 'Streaks',
  guided_tour: 'Guided tour', push_notifications: 'Push enabled',
};
