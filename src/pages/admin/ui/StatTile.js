import React from 'react';
import InfoTip from './InfoTip';

const StatTile = ({ icon: Icon, label, value, hint, info, primary = false }) => (
  <div className={`ad-tile${primary ? ' ad-tile--primary' : ''}`}>
    {Icon && <div className="ad-tile__chip" aria-hidden="true"><Icon size={16} /></div>}
    <div className="ad-tile__label">{label}{info && <InfoTip text={info} />}</div>
    <div className="ad-tile__value">{value}</div>
    {hint ? <div className="ad-tile__hint">{hint}</div> : null}
  </div>
);

export default StatTile;
