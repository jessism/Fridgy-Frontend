import React from 'react';

const AdminCard = ({ title, sub, hint, actions, className = '', children }) => (
  <section className={`ad-card ${className}`.trim()}>
    {(title || actions) && (
      <div className="ad-card__head">
        {title && (
          <h2 className="ad-card__title">
            {title}
            {sub != null && <span className="ad-card__sub">{sub}</span>}
          </h2>
        )}
        {actions && <div className="ad-page-header__actions">{actions}</div>}
      </div>
    )}
    {children}
    {hint && <p className="ad-card__hint">{hint}</p>}
  </section>
);

export default AdminCard;
