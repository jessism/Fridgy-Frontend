import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users as UsersIcon, UserPlus, Activity, CreditCard, ShoppingCart } from 'lucide-react';
import { fetchOverview, POSTHOG_LINKS, FEATURE_LABELS } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, StatTile, Badge, ErrorState, Skeleton } from './ui';

const RANGES = [7, 30, 90];
const SERIES = { mobile: '#2d8a4e', web: '#4f6fd6' }; // validated pair (dataviz skill)

const TONE_BY_STATUS = {
  active: 'good', trialing: 'good',
  canceling: 'warn', past_due: 'warn',
  grandfathered: 'info',
};

export const SubscriptionBadge = ({ sub }) => {
  const status = sub?.status || 'free';
  const suffix = sub?.source && sub.source !== 'grandfathered' ? ` · ${sub.source}` : '';
  return <Badge tone={TONE_BY_STATUS[status] || 'muted'}>{status}{suffix}</Badge>;
};

const OverviewPage = () => {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setOverview(null);
    setError(null);
    fetchOverview(days)
      .then((d) => { if (!cancelled) setOverview(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [days, reloadKey]);

  const t = overview?.totals;
  const subs = overview?.subscriptions?.counts || {};
  const paying = (subs.active || 0) + (subs.trialing || 0) + (subs.canceling || 0);

  const rangePicker = (
    <div className="ad-segment" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          className={days === r ? 'is-active' : undefined}
          onClick={() => setDays(r)}
        >
          {r}d
        </button>
      ))}
    </div>
  );

  return (
    <div className="aa">
      <AdminPageHeader
        title="Overview"
        actions={rangePicker}
        description={`Real users only — accounts with “test” in the email, ${overview?.excludedEmails?.join(', ') || 'internal addresses'}, admins and the system user are excluded. Behavioural analytics (DAU/MAU, retention, feature trends) live in PostHog — links below.`}
      />

      {error && <ErrorState onRetry={() => setReloadKey((k) => k + 1)}>Couldn’t load overview: {error}</ErrorState>}

      <section className="ad-tiles">
        <StatTile
          icon={UsersIcon}
          primary
          label="Real users"
          value={t ? t.realUsers : '…'}
          hint={t ? `${t.activated} activated (${t.realUsers ? Math.round((100 * t.activated) / t.realUsers) : 0}%)` : ''}
        />
        <StatTile icon={UserPlus} label={`New in ${days}d`} value={t ? t.signupsInWindow : '…'} hint={t ? `${t.signups7d} in the last 7d` : ''} />
        <StatTile
          icon={Activity}
          label="Active 7d"
          value={t ? (t.lastActiveTracked ? t.active7d : '—') : '…'}
          hint={t && !t.lastActiveTracked ? 'Apply migration 078 to start tracking' : t ? `${t.active1d} today · ${t.active30d} in 30d` : ''}
        />
        <StatTile icon={CreditCard} label="Paying" value={overview ? paying : '…'} hint={overview ? `${subs.grandfathered || 0} grandfathered · ${subs.free || 0} free` : ''} />
        <StatTile icon={ShoppingCart} label={`Purchases in ${days}d`} value={overview ? overview.subscriptions.newPurchasesInWindow : '…'} hint={overview ? `${overview.subscriptions.expirationsInWindow} expirations` : ''} />
      </section>

      <section className="aa__grid">
        <AdminCard title="Signups per day">
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
          ) : <Skeleton height={240} />}
        </AdminCard>

        <AdminCard
          title="Subscriptions"
          hint="From RevenueCat webhook events + Stripe subscriptions. “grandfathered” is lifetime-free, not revenue."
        >
          {overview ? (
            <ul className="aa-list">
              {Object.entries(subs).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <li key={k}><SubscriptionBadge sub={{ status: k }} /><span className="aa-list__num">{v}</span></li>
              ))}
            </ul>
          ) : <Skeleton />}
        </AdminCard>
      </section>

      <div className="aa-section">
        <AdminCard
          title="Feature adoption"
          sub={`share of real users who used each feature at least once · active in ${days}d`}
          hint="Counted from database rows, so browse-only surfaces (cooking mode, voice cooking, screen views) don’t appear here — see PostHog “feature_used” for those."
        >
          {overview ? (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Feature</th><th>Adoption</th><th className="num">Users</th>
                    <th className="num">Active {days}d</th><th className="num">Rows</th>
                    <th className="num">Median / user</th><th className="num">p90</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.features.map((f) => (
                    <tr key={f.feature}>
                      <td>{FEATURE_LABELS[f.feature] || f.feature}</td>
                      <td className="aa-bar-cell">
                        <div className="aa-bar" aria-hidden="true"><div className="aa-bar__fill" style={{ width: `${f.adoptionPct}%` }} /></div>
                        <span className="aa-bar__label">{f.adoptionPct}%</span>
                      </td>
                      <td className="num">{f.adopters}</td>
                      <td className="num">{f.activeInWindow} <span className="ad-muted">({f.activePct}%)</span></td>
                      <td className="num">{f.rows}</td>
                      <td className="num">{f.medianPerAdopter}</td>
                      <td className="num">{f.p90PerAdopter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Skeleton />}
        </AdminCard>
      </div>

      <section className="aa__posthog">
        {POSTHOG_LINKS.map((l) => (
          <a key={l.key} className="ad-card aa-card--link" href={l.url} target="_blank" rel="noreferrer">
            <div className="ad-card__title">{l.title} <span className="aa-card__ext">↗ PostHog</span></div>
            <p className="ad-card__hint">{l.blurb}</p>
          </a>
        ))}
      </section>
    </div>
  );
};

export default OverviewPage;
