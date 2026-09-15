import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './admin-tokens.css';
import './AdminLayout.css';
import './admin-pages.css';

// Every admin page is imported STATICALLY here on purpose — see the note on
// the component below. This module is the one lazy() boundary for /admin.
import OverviewPage from './OverviewPage';
import UsersPage from './UsersPage';
import UserDetailPage from './UserDetailPage';
import SocialPage from './SocialPage';
import InfluencersPage from './InfluencersPage';
import PromoCodesPage from './PromoCodesPage';
import FeedbackPage from './FeedbackPage';
import DiagnosticsPage from './DiagnosticsPage';
import BlogAdmin from '../BlogAdmin';
import BlogRecipeEditor from '../BlogRecipeEditor';

/** /admin/analytics/users/:id → /admin/users/:id (old bookmarks). */
const RedirectUser = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/users/${id}`} replace />;
};

/**
 * Shell for the whole /admin area.
 *
 * The route table lives HERE rather than in App.js so the chunking actually
 * works: App.js lazy-loads only this module, and every page hangs off the
 * static imports above. The result is exactly one admin chunk — public
 * visitors download none of it (Recharts included), and moving between admin
 * pages costs no extra network round trip. If App.js named the page
 * components directly they would land in the main bundle instead.
 */
const SIDEBAR_ID = 'ad-sidebar';

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close on navigation — otherwise the drawer stays over the new page.
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="admin-root">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="ad-topbar">
        <button
          type="button"
          className="ad-topbar__btn"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls={SIDEBAR_ID}
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <span className="ad-topbar__title">Trackabite Admin</span>
      </div>

      <AdminSidebar id={SIDEBAR_ID} open={drawerOpen} onNavigate={closeDrawer} />

      {drawerOpen && (
        <button
          type="button"
          className="ad-scrim"
          aria-label="Close navigation"
          onClick={closeDrawer}
        />
      )}

      <main className="ad-content">
        <Routes>
          <Route index element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="influencers" element={<InfluencersPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="blog/new" element={<BlogRecipeEditor />} />
          <Route path="blog/edit/:id" element={<BlogRecipeEditor />} />
          <Route path="promos" element={<PromoCodesPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="diagnostics" element={<DiagnosticsPage />} />
          {/* legacy /admin/analytics/* bookmarks */}
          <Route path="analytics" element={<Navigate to="/admin" replace />} />
          <Route path="analytics/users/:id" element={<RedirectUser />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
