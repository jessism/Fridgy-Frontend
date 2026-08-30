import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserDetail, FEATURE_LABELS, formatDate, formatDateTime, timeAgo } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, ErrorState, Skeleton } from './ui';

const Row = ({ k, v }) => (
  <div className="aa-kv"><span className="aa-kv__k">{k}</span><span className="aa-kv__v">{v ?? '—'}</span></div>
);

const UserDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetchUserDetail(id)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id]);

  const u = data?.user;
  const live = data?.revenueCatLive;
  const entitlements = live?.entitlements ? Object.entries(live.entitlements) : [];
  const title = u ? (u.firstName || u.email) : 'User';

  return (
    <div className="aa">
      <AdminPageHeader
        title={title}
        crumbs={[{ label: 'Users', to: '/admin/users' }, { label: title }]}
      />

      {error && <ErrorState>{error}</ErrorState>}
      {!data && !error && <Skeleton />}

      {data && (
        <>
          {u.excluded && (
            <ErrorState>This account is excluded from the aggregate numbers (test / internal / admin).</ErrorState>
          )}

          <section className="aa__grid aa__grid--3">
            <AdminCard title="Profile">
              <Row k="Email" v={u.email} />
              <Row k="Name" v={u.firstName} />
              <Row k="Signed up" v={`${formatDate(u.createdAt)} · ${u.signupPlatform || '—'}`} />
              <Row k="Last active" v={u.lastActiveAt ? `${timeAgo(u.lastActiveAt)} (${formatDateTime(u.lastActiveAt)})` : 'not tracked yet'} />
              <Row k="Tier (users.tier)" v={`${u.tier}${u.isGrandfathered ? ' · grandfathered' : ''}`} />
              <Row k="Deletion" v={u.deletionStatus || 'none'} />
              <Row k="User id" v={<code className="ad-code">{u.id}</code>} />
            </AdminCard>

            <AdminCard title="Subscription">
              <Row k="Enforced tier" v={data.subscription.tier} />
              <Row k="State" v={`${data.subscription.status}${data.subscription.source ? ` (${data.subscription.source})` : ''}`} />
              <Row k="Live evidence" v={data.evidence ? `${data.evidence.source} · ${data.evidence.status}${data.evidence.expiresAt ? ` · until ${formatDate(data.evidence.expiresAt)}` : ''}` : 'none'} />
              <Row k="Product" v={data.subscription.productId} />
              {data.discrepancies?.length > 0 && data.discrepancies.map((d) => (
                <p key={d.type} className="ad-card__hint aa-attention-note">{d.detail}</p>
              ))}
              {data.stripeSubscription && (
                <>
                  <Row k="Stripe status" v={data.stripeSubscription.status} />
                  <Row k="Period end" v={formatDate(data.stripeSubscription.current_period_end)} />
                </>
              )}
              <h3 className="aa-card__subtitle">RevenueCat (live)</h3>
              {live ? (
                entitlements.length ? entitlements.map(([name, e]) => (
                  <Row
                    key={name}
                    k={name}
                    v={`${e.expires_date && new Date(e.expires_date) > new Date() ? 'active' : 'expired'} · until ${formatDate(e.expires_date)} · ${e.product_identifier || ''}`}
                  />
                )) : <p className="ad-card__hint">Customer exists, no entitlements.</p>
              ) : <p className="ad-card__hint">No RevenueCat customer for this email.</p>}
            </AdminCard>

            <AdminCard title="Feature usage">
              <table className="ad-table">
                <tbody>
                  {Object.entries(data.featureCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <tr key={k}><td>{FEATURE_LABELS[k] || k}</td><td className="num">{v}</td></tr>
                  ))}
                </tbody>
              </table>
              {data.streak && (
                <p className="ad-card__hint">
                  Streak {data.streak.current_streak} (best {data.streak.longest_streak}) · last activity {data.streak.last_activity_date || '—'}
                </p>
              )}
              {data.onboarding && (
                <p className="ad-card__hint">
                  Goal: {data.onboarding.primary_goal || '—'} · household {data.onboarding.household_size ?? '—'} · onboarding {data.onboarding.onboarding_completed ? 'completed' : 'incomplete'}
                </p>
              )}
            </AdminCard>
          </section>

          <div className="aa-section">
            <AdminCard title="RevenueCat events" sub={data.revenueCatEvents.length} hint="Sandbox rows are shown for context but never count toward any number.">
              {data.revenueCatEvents.length ? (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr><th>When</th><th>Event</th><th>Period</th><th>Env</th><th>Expires</th><th>Product</th><th>Processed</th></tr></thead>
                    <tbody>
                      {data.revenueCatEvents.map((e, i) => (
                        <tr key={i} className={e.environment === 'SANDBOX' ? 'aa-row--sandbox' : undefined}>
                          <td>{formatDateTime(e.created_at)}</td>
                          <td>{e.event_type}</td>
                          <td>{e.period_type || '—'}</td>
                          <td>{e.environment === 'SANDBOX' ? <span className="ad-badge ad-badge--warn">sandbox</span> : (e.environment || '—')}</td>
                          <td>{e.expires_at ? formatDate(e.expires_at) : '—'}</td>
                          <td>{e.product_id || '—'}</td>
                          <td>{e.processed ? 'yes' : e.error_message || 'no'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="ad-card__hint">No webhook events for this email.</p>}
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetailPage;
