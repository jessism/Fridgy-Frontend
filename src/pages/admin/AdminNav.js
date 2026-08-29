import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/content', label: 'TikTok upload' },
];

const AdminNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {ITEMS.map((it) => (
        <Link key={it.to} to={it.to} className={`admin-nav__link${pathname.startsWith(it.to) ? ' admin-nav__link--active' : ''}`}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
};

export default AdminNav;
