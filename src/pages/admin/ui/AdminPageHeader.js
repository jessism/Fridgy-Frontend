import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Page header. Rendered by each page rather than the layout, so pages own
 * their own title/actions without any context plumbing.
 *
 * crumbs: [{ label, to? }] — the last entry is rendered as plain text.
 */
const AdminPageHeader = ({ title, crumbs = [], description, actions }) => (
  <header className="ad-page-header">
    {crumbs.length > 0 && (
      <nav className="ad-crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={`${c.label}-${i}`}>
            {i > 0 && <span className="ad-crumbs__sep" aria-hidden="true">›</span>}
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          </React.Fragment>
        ))}
      </nav>
    )}
    <div className="ad-page-header__bar">
      <h1 className="ad-page-header__title">{title}</h1>
      {actions && <div className="ad-page-header__actions">{actions}</div>}
    </div>
    {description && <p className="ad-page-header__desc">{description}</p>}
  </header>
);

export default AdminPageHeader;
