import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../features/auth/context/AuthContext';
import { fetchOverview, fetchUsers, POSTHOG_LINKS, FEATURE_LABELS, formatDate, timeAgo } from '../../features/admin-analytics/api';
import AdminNav from './AdminNav';
import './AdminAnalytics.css';

const RANGES = [7, 30, 90];
const SERIES = { mobile: '#2d8a4e', web: '#4f6fd6' }; // validated pair (dataviz skill)

const StatTile = ({ label, value, hint }) => (
  <div className="aa-tile">
    <div className="aa-tile__label">{label}</div>
    <div className="aa-tile__value">{value}</div>
    {hint && <div className="aa-tile__hint">{hint}</div>}
  </div>
);

const SubscriptionBadge = ({ sub }) => {
  const status = sub?.status || 'free';
  const cls = ['active', 'trialing'].includes(status) ? 'good' : ['canceling', 'past_due'].includes(status) ? 'warn' : status === 'grandfathered' ? 'info' : 'muted';
  return <span className={`aa-badge aa-badge--${cls}`}>{status}{sub?.source && sub.source !== 'grandfathered' ? ` · ${sub.source}` : ''}</span>;
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [usersData, setUsersData] = useState(null);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    if (user && !user.isAdmin) navigate('/home');
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    setOverview(null); setOverviewError(null);
    fetchOverview(days).then((d) => !cancelled && setOverview(d)).catch((e) => !cancelled && setOverviewError(e.message));
    return () => { cancelled = true; };
  }, [days]);

  const loadUsers = useCallback(() => {
    setUsersError(null);
    fetchUsers({ search, sort, dir: 'desc', page: 1, pageSize: 100 }).then(setUsersData).catch((e) => setUsersError(e.message));
  }, [search, sort]);

  useEffect(() => { const t = setTimeout(loadUsers, 250); return () => clearTimeout(t); }, [loadUsers]);

  if (!user?.isAdmin) return null;

  const t = overview?.totals;
  const subs = overview?.subscriptions?.counts || {};
  const paying = (subs.active || 0) + (subs.trialing || 0) + (subs.canceling || 0);

  return (
    <div className="aa">
      <header className="aa__header">
        <div className="aa__header-left">
          <Link to="/home" className="aa__back">&larr; Back</Link>
          <h1 className="aa__title">Analytics</h1>
          <AdminNav />
        </div>
        <div className="aa__range" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} type="button" className={`aa__range-btn${days === r ? ' aa__range-btn--active' : ''}`} onClick={() => setDays(r)}>
              {r}d
            </button>
          ))}
        </div>
      </header>

      <p className="aa__note">
        Real users only — accounts with “test” in the email, {overview?.excludedEmails?.join(', ') || 'internal addresses'}, admins and the system user are excluded.
        Behavioural analytics (DAU/MAU, retention, feature trends) live in PostHog — links below.
      </p>

      {overviewError && <div className="aa__error">Couldn’t load overview: {overviewError}</div>}

      <section className="aa__tiles">
        <StatTile label="Real users" value={t ? t.realUsers : '…'} hint={t ? `${t.activated} activated (${t.realUsers ? Math.round((100 * t.activated) / t.realUsers) : 0}%)` : ''} />
        <StatTile label={`New in ${days}d`} value={t ? t.signupsInWindow : '…'} hint={t ? `${t.signups7d} in the last 7d` : ''} />
        <StatTile label="Active 7d" value={t ? (t.lastActiveTracked ? t.active7d : '—') : '…'} hint={t && !t.lastActiveTracked ? 'Apply migration 078 to start tracking' : t ? `${t.active1d} today · ${t.active30d} in 30d` : ''} />
        <StatTile label="Paying" value={overview ? paying : '…'} hint={overview ? `${subs.grandfathered || 0} grandfathered · ${subs.free || 0} free` : ''} />
        <StatTile label={`Purchases in ${days}d`} value={overview ? overview.subscriptions.newPurchasesInWindow : '…'} hint={overview ? `${overview.subscriptions.expirationsInWindow} expirations` : ''} />
      </section>

      <section className="aa__grid">
        <div className="aa-card aa-card--wide">
          <h2 className="aa-card__title">Signups per day</h2>
          {overview ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={overview.signupSeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#e7e7e4" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11, fill: '#52514e' }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#52514e' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="mobile" name="Mobile" stackId="a" fill={SERIES.mobile} stroke="#fcfcfb" strokeWidth={2} />
                  <Bar dataKey="web" name="Web" stackId="a" fill={SERIES.web} stroke="#fcfcfb" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="aa-chart__foot">
                {Object.entries(overview.signupsByPlatform).map(([k, v]) => <span key={k}>{k}: <strong>{v}</strong></span>)}
              </div>
            </div>
          ) : <div className="aa-skeleton" />}
        </div>

        <div className="aa-card">
          <h2 className="aa-card__title">Subscriptions</h2>
          {overview ? (
            <ul className="aa-list">
              {Object.entries(subs).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <li key={k}><SubscriptionBadge sub={{ status: k }} /><span className="aa-list__num">{v}</span></li>
              ))}
            </ul>
          ) : <div className="aa-skeleton" />}
          <p className="aa-card__hint">From RevenueCat webhook events + Stripe subscriptions. “grandfathered” is lifetime-free, not revenue.</p>
        </div>
      </section>

      <section className="aa-card">
        <h2 className="aa-card__title">Feature adoption <span className="aa-card__sub">share of real users who used each feature at least once · active in {days}d</span></h2>
        {overview ? (
          <table className="aa-table aa-table--adoption">
            <thead><tr><th>Feature</th><th>Adoption</th><th className="num">Users</th><th className="num">Active {days}d</th><th className="num">Rows</th><th className="num">Median / user</th><th className="num">p90</th></tr></thead>
            <tbody>
              {overview.features.map((f) => (
                <tr key={f.feature}>
                  <td>{FEATURE_LABELS[f.feature] || f.feature}</td>
                  <td className="aa-bar-cell">
                    <div className="aa-bar" aria-hidden="true"><div className="aa-bar__fill" style={{ width: `${f.adoptionPct}%` }} /></div>
                    <span className="aa-bar__label">{f.adoptionPct}%</span>
                  </td>
                  <td className="num">{f.adopters}</td>
                  <td className="num">{f.activeInWindow} <span className="aa-muted">({f.activePct}%)</span></td>
                  <td className="num">{f.rows}</td>
                  <td className="num">{f.medianPerAdopter}</td>
                  <td className="num">{f.p90PerAdopter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="aa-skeleton" />}
        <p className="aa-card__hint">Counted from database rows, so browse-only surfaces (cooking mode, voice cooking, screen views) don’t appear here — see PostHog “feature_used” for those.</p>
      </section>

      <section className="aa__posthog">
        {POSTHOG_LINKS.map((l) => (
          <a key={l.key} className="aa-card aa-card--link" href={l.url} target="_blank" rel="noreferrer">
            <div className="aa-card__title">{l.title} <span className="aa-card__ext">↗ PostHog</span></div>
            <p className="aa-card__hint">{l.blurb}</p>
          </a>
        ))}
      </section>

      <section className="aa-card">
        <div className="aa-card__head">
          <h2 className="aa-card__title">Users {usersData ? <span className="aa-card__sub">{usersData.total}</span> : null}</h2>
          <div className="aa-card__controls">
            <input className="aa-input" type="search" placeholder="Search email or name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="aa-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort users">
              <option value="created_at">Newest signup</option>
              <option value="last_active_at">Recently active</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
        {usersError && <div className="aa__error">{usersError}</div>}
        {usersData ? (
          <div className="aa-table-wrap">
            <table className="aa-table aa-table--users">
              <thead><tr><th>User</th><th>Signed up</th><th>Platform</th><th>Subscription</th><th>Last active</th><th className="num">Streak</th><th>Uses</th></tr></thead>
              <tbody>
                {usersData.users.map((u) => (
                  <tr key={u.id} className="aa-row--link" onClick={() => navigate(`/admin/analytics/users/${u.id}`)}>
                    <td><div className="aa-user__email">{u.email}</div><div className="aa-muted">{u.firstName || '—'}{u.deletionStatus ? ` · ${u.deletionStatus}` : ''}</div></td>
                    <td title={u.createdAt}>{formatDate(u.createdAt)}</td>
                    <td>{u.signupPlatform || '—'}</td>
                    <td><SubscriptionBadge sub={u.subscription} /></td>
                    <td title={u.lastActiveAt || ''}>{timeAgo(u.lastActiveAt)}</td>
                    <td className="num">{u.streak?.current_streak ?? 0}</td>
                    <td className="aa-user__features">
                      {Object.entries(u.features).filter(([k]) => !['guided_tour', 'push_notifications'].includes(k)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="aa-chip">{FEATURE_LABELS[k] || k} <strong>{v}</strong></span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="aa-skeleton" />}
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
