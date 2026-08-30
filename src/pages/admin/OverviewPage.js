import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users as UsersIcon, UserPlus, Activity, CreditCard, Sparkles, Flame } from 'lucide-react';
import { fetchOverview, POSTHOG_LINKS, FEATURE_LABELS } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, StatTile, Badge, ErrorState, Skeleton, InfoTip } from './ui';

const RANGES = [7, 30, 90];
const SERIES = { mobile: '#2d8a4e', web: '#4f6fd6' }; // validated pair (dataviz skill)

// Exactly the six statuses the API can emit — nothing else can appear.
const TONE_BY_STATUS = {
  active: 'good', trialing: 'info', canceling: 'warn', past_due: 'warn',
  grandfathered: 'info', free: 'muted',
};
const STATUS_ORDER = ['active', 'trialing', 'canceling', 'past_due', 'grandfathered', 'free'];

const DISCREPANCY_LABEL = {
  premium_without_evidence: 'Premium, no live evidence',
  free_with_evidence: 'Free, but has live subscription',
  grandfathered_flag_on_free_tier: 'Grandfathered flag on free tier',
  sandbox_events: 'Sandbox events on real account',
};

export const SubscriptionBadge = ({ sub }) => {
  const status = sub?.status || 'free';
  const suffix = sub?.source && sub.source !== 'grandfathered' ? ` · ${sub.source}` : '';
  return <Badge tone={TONE_BY_STATUS[status] || 'muted'}>{status}{suffix}</Badge>;
};

const axisTick = { fontSize: 11, fill: '#52514e' };

// How each tile is calculated. Mirrors services/adminAnalyticsService.js.
const DEF = {
  realUsers: 'Every account except: email containing "test", the internal addresses listed above, admins, and the system user. "Activated" = did at least one thing in the Feature adoption table (Setup rows excluded).',
  newIn: (d) => `Accounts created in the last ${d} calendar days (Pacific), including today. Same buckets as the Signups chart, so this is exactly the sum of the bars.`,
  active7d: 'Real users seen in the last 7×24h. "Seen" is the later of users.last_active_at (any authenticated API call; tracked since 2026-08-29) and the user\'s latest feature write, so activity from before tracking still counts.',
  paying: 'Users whose users.tier is premium AND who have live evidence with status active, canceling or past_due — a Stripe row, or an unexpired RevenueCat PRODUCTION event. Trialing is shown separately. Grandfathered is lifetime-free, not revenue.',
  paidStarts: (d) => `In the last ${d} days, production events for real users only: RevenueCat INITIAL_PURCHASE with period_type NORMAL, plus a RENEWAL that follows a TRIAL (the trial converting), plus Stripe subscriptions created. Trials = INITIAL_PURCHASE with period_type TRIAL. Lapsed = EXPIRATION events split by period_type, plus Stripe cancellations.`,
  onStreak: 'user_streaks.current_streak > 0 right now. Avg = mean current_streak over those users.',
  longestEver: 'Highest longest_streak across all real users with a streak row.',
  avgLongest: 'Mean of longest_streak over real users who have a streak row (users who never started one are not included).',
  inGrace: 'grace_period_expires_at is in the future: the user lost a streak and can still restore it.',
  freezes: 'Sum of freezes_used_total across real users, all time.',
};
const tzLabel = (tz) => (tz === 'America/Vancouver' ? 'Pacific' : tz);

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
  const subs = overview?.subscriptions;
  const counts = subs?.counts || {};
  const streaks = overview?.streaks;
  const tz = overview ? tzLabel(overview.timezone) : 'local';

  const rangePicker = (
    <div className="ad-segment" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <button key={r} type="button" className={days === r ? 'is-active' : undefined} onClick={() => setDays(r)}>
          {r}d
        </button>
      ))}
    </div>
  );

  const features = (overview?.features || []).filter((f) => f.group !== 'setup');
  const setup = (overview?.features || []).filter((f) => f.group === 'setup');

  const adoptionRow = (f) => (
    <tr key={f.feature}>
      <td>{FEATURE_LABELS[f.feature] || f.feature}<InfoTip text={f.definition} /></td>
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
  );

  return (
    <div className="aa">
      <AdminPageHeader
        title="Overview"
        actions={rangePicker}
        description={`Real users only — accounts with “test” in the email, ${overview?.excludedEmails?.join(', ') || 'internal addresses'}, admins and the system user are excluded. Behavioural analytics (DAU/MAU, retention, feature trends) live in PostHog — links below.`}
      />

      {error && <ErrorState onRetry={() => setReloadKey((k) => k + 1)}>Couldn’t load overview: {error}</ErrorState>}
      {overview?.featureErrors?.length > 0 && (
        <ErrorState>
          Some adoption rows could not be loaded and are missing from the table: {overview.featureErrors.map((f) => `${f.feature} (${f.error})`).join('; ')}
        </ErrorState>
      )}

      <section className="ad-tiles">
        <StatTile
          icon={UsersIcon}
          primary
          label="Real users"
          info={DEF.realUsers}
          value={t ? t.realUsers : '…'}
          hint={t ? `${t.activated} activated (${t.realUsers ? Math.round((100 * t.activated) / t.realUsers) : 0}%)${t.pendingDeletion ? ` · ${t.pendingDeletion} pending deletion` : ''}` : ''}
        />
        <StatTile
          icon={UserPlus}
          label={`New in ${days}d`}
          info={DEF.newIn(days)}
          value={t ? t.signupsInWindow : '…'}
          hint={t ? `${t.signups7d} in the last 7 calendar days` : ''}
        />
        <StatTile
          icon={Activity}
          label="Active 7d"
          info={DEF.active7d}
          value={t ? t.active7d : '…'}
          hint={t ? `${t.active1d} today · ${t.active30d} in 30d` : ''}
        />
        <StatTile
          icon={CreditCard}
          label="Paying"
          info={DEF.paying}
          value={subs ? subs.paying : '…'}
          hint={subs ? `${counts.trialing || 0} trialing · ${counts.grandfathered || 0} grandfathered · ${counts.free || 0} free` : ''}
        />
        <StatTile
          icon={Sparkles}
          label={`Paid starts in ${days}d`}
          info={DEF.paidStarts(days)}
          value={subs ? subs.paidStarts : '…'}
          hint={subs ? `${subs.trialsStarted} trials started · lapsed: ${subs.lapsed.trial} trial, ${subs.lapsed.paid} paid` : ''}
        />
      </section>

      <section className="aa__grid">
        <AdminCard title={`Signups per day (${tz})`}>
          {overview ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={overview.signupSeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#e7e7e4" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={axisTick} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="mobile" name="Mobile" stackId="a" fill={SERIES.mobile} stroke="#fcfcfb" strokeWidth={2} />
                  <Bar dataKey="web" name="Web" stackId="a" fill={SERIES.web} stroke="#fcfcfb" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="aa-chart__foot">
                <span>In window — mobile: <strong>{overview.signupsByPlatform.mobile}</strong> · web: <strong>{overview.signupsByPlatform.web}</strong>{overview.signupsByPlatform.other ? <> · other: <strong>{overview.signupsByPlatform.other}</strong></> : null}</span>
                <span className="ad-muted">All time — mobile {overview.signupsByPlatformAllTime.mobile} · web {overview.signupsByPlatformAllTime.web}</span>
              </div>
            </div>
          ) : <Skeleton height={240} />}
        </AdminCard>

        <AdminCard
          title="Subscriptions"
          hint="Buckets follow users.tier (what the app enforces). Stripe and RevenueCat production events refine premium into active / trialing / canceling / past due. “grandfathered” is lifetime-free, not revenue."
        >
          {overview ? (
            <ul className="aa-list">
              {STATUS_ORDER.filter((k) => counts[k] > 0).map((k) => (
                <li key={k}><SubscriptionBadge sub={{ status: k }} /><span className="aa-list__num">{counts[k]}</span></li>
              ))}
            </ul>
          ) : <Skeleton />}
        </AdminCard>
      </section>

      <div className="aa-section">
        <AdminCard
          title="Streaks"
          sub={streaks ? `${streaks.summary.usersWithHistory} of ${t.realUsers} users have a streak history` : undefined}
          hint={streaks ? `One log row per user per local day, so a user counts at most once per day. Streaks launched ${streaks.launchedOn} — earlier days are empty, not zero engagement. Avg ${streaks.summary.avgActiveDays} active days per streak user (median ${streaks.summary.medianActiveDays}).` : undefined}
        >
          {streaks ? (
            <>
              <div className="ad-tiles aa-streak-tiles">
                <StatTile icon={Flame} label="On a streak now" info={DEF.onStreak} value={streaks.summary.onStreakNow} hint={streaks.summary.onStreakNow ? `avg ${streaks.summary.avgCurrentStreak} days` : ''} />
                <StatTile label="Longest ever" info={DEF.longestEver} value={`${streaks.summary.longestEver}d`} hint="best single streak" />
                <StatTile label="Avg longest" info={DEF.avgLongest} value={`${streaks.summary.avgLongestStreak}d`} hint="per user with history" />
                <StatTile label="In grace" info={DEF.inGrace} value={streaks.summary.inGrace} hint="lost a streak, can still restore" />
                <StatTile label="Freezes used" info={DEF.freezes} value={streaks.summary.freezesUsed} hint="all time" />
              </div>
              <h3 className="aa-card__subtitle">Streak-active users per day ({tz})</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={streaks.dailyActive} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#e7e7e4" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={axisTick} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="users" name="Users" fill={SERIES.web} stroke="#fcfcfb" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="aa-chart__foot">
                <span>Longest streak — {streaks.distribution.map((b) => <span key={b.label} className="aa-chip">{b.label}d <strong>{b.users}</strong></span>)}</span>
                <span>Milestones — {streaks.milestones.length ? streaks.milestones.map((m) => `${m.milestone}-day × ${m.users}`).join(' · ') : 'none yet'}</span>
                <span className="ad-muted">Days logged — {Object.entries(streaks.statusMix).map(([k, v]) => `${k} ${v}`).join(' · ')}</span>
              </div>
            </>
          ) : <Skeleton />}
        </AdminCard>
      </div>

      <div className="aa-section">
        <AdminCard
          title="Feature adoption"
          sub={`share of all real users who did each thing at least once · active in the last ${days} days`}
          hint="Counted from database rows a user chose to create (failed imports excluded). Browse-only surfaces (cooking mode, voice cooking, screen views) don’t appear here — see PostHog “feature_used”. Setup rows are excluded from “Activated”."
        >
          {overview ? (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Feature</th><th>Of all users</th><th className="num">Users</th>
                    <th className="num">Active {days}d</th><th className="num">Rows</th>
                    <th className="num">Median / user</th><th className="num">p90</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(adoptionRow)}
                  {setup.length > 0 && (
                    <tr className="aa-group-row"><td colSpan={7}>Setup</td></tr>
                  )}
                  {setup.map(adoptionRow)}
                </tbody>
              </table>
            </div>
          ) : <Skeleton />}
        </AdminCard>
      </div>

      {overview?.assumptions?.length > 0 && (
        <details className="aa-assumptions">
          <summary>How these numbers are counted</summary>
          <ul>
            {overview.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </details>
      )}

      {subs?.discrepancies?.length > 0 && (
        <div className="aa-section">
          <AdminCard
            title="Needs attention"
            sub={subs.discrepancies.length}
            className="aa-card--attention"
            hint="Where the live evidence (Stripe row, RevenueCat production event) disagrees with users.tier — the tier the app actually enforces. The tiles above follow users.tier; these rows are the exceptions, listed here so they don’t get in the way of the numbers."
          >
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead><tr><th>Issue</th><th>User</th><th>Detail</th></tr></thead>
                <tbody>
                  {subs.discrepancies.map((d, i) => (
                    <tr key={`${d.userId}-${d.type}-${i}`}>
                      <td><Badge tone="warn">{DISCREPANCY_LABEL[d.type] || d.type}</Badge></td>
                      <td><a href={`/admin/users/${d.userId}`}>{d.email}</a></td>
                      <td className="ad-feedback__msg">{d.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      )}

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
