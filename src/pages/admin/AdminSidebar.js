import React from 'react';
import { Link, NavLink, useLocation, matchPath } from 'react-router-dom';
import {
  LayoutDashboard, Users, Share2, Newspaper, Ticket,
  MessageSquare, Activity, LogOut, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';

/**
 * URLs are flat under /admin; the grouping here is purely visual.
 * `end` marks items that must match exactly (only /admin itself, which would
 * otherwise stay active on every child route).
 */
export const NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/admin/social', label: 'Social Media', icon: Share2 },
      { to: '/admin/blog', label: 'Blog', icon: Newspaper },
      { to: '/admin/promos', label: 'Promo Codes', icon: Ticket },
    ],
  },
  {
    label: 'Support',
    items: [{ to: '/admin/feedback', label: 'Feedback', icon: MessageSquare }],
  },
  {
    label: 'System',
    items: [{ to: '/admin/diagnostics', label: 'Diagnostics', icon: Activity }],
  },
];

/** Drill-downs keep their parent item active (/admin/users/:id → Users). */
const isItemActive = (item, pathname) =>
  Boolean(matchPath({ path: item.to, end: Boolean(item.end) }, pathname));

const AdminSidebar = ({ open, onNavigate, id }) => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside id={id} className={`ad-sidebar${open ? ' is-open' : ''}`} aria-label="Admin sections">
      <Link to="/admin" className="ad-sidebar__brand" onClick={onNavigate}>
        Trackabite Admin
      </Link>

      {NAV_GROUPS.map((group) => (
        <div className="ad-sidebar__group" key={group.label}>
          <div className="ad-sidebar__group-label">{group.label}</div>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={`ad-sidebar__item${isItemActive(item, pathname) ? ' is-active' : ''}`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="ad-sidebar__spacer" />

      <div className="ad-sidebar__footer">
        {user?.email && <div className="ad-sidebar__email" title={user.email}>{user.email}</div>}
        <Link to="/home" className="ad-sidebar__action" onClick={onNavigate}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to app</span>
        </Link>
        <button type="button" className="ad-sidebar__action" onClick={signOut}>
          <LogOut size={16} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
