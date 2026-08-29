import React from 'react';

/** tone: good | warn | info | bad | muted */
const Badge = ({ tone = 'muted', children }) => (
  <span className={`ad-badge ad-badge--${tone}`}>{children}</span>
);

export default Badge;
