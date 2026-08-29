import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { fetchUserDetail, FEATURE_LABELS, formatDate, formatDateTime, timeAgo } from '../../features/admin-analytics/api';
import AdminNav from './AdminNav';
import './AdminAnalytics.css';

const Row = ({ k, v }) => (<div className="aa-kv"><span className="aa-kv__k">{k}</span><span className="aa-kv__v">{v ?? '—'}</span></div>);

const AnalyticsUserDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (user && !user.isAdmin) navigate('/home'); }, [user, navigate]);
  useEffect(() => {
    setData(null); setError(null);
    fetchUserDetail(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (!user?.isAdmin) return null;

  const u = data?.user;
  const live = data?.revenueCatLive;
  const entitlements = live?.entitlements ? Object.entries(live.entitlements) : [];

  return (
    <div className="aa">
      <header className="aa__header">
        <div className="aa__header-left">
          <Link to="/admin/analytics" className="aa__back">&larr; All users</Link>
          <h1 className="aa__title">{u ? (u.firstName || u.email) : 'User'}</h1>
          <AdminNav />
        </div>
      </header>

      {error && <div className="aa__error">{error}</div>}
      {!data && !error && <div className="aa-skeleton" />}

      {data && (
        <>
          {u.excluded && <div className="aa__error">This account is excluded from the aggregate numbers (test / internal / admin).</div>}
          <section className="aa__grid aa__grid--3">
            <div className="aa-card">
              <h2 className="aa-card__title">Profile</h2>
              <Row k="Email" v={u.email} />
              <Row k="Name" v={u.firstName} />
              <Row k="Signed up" v={`${formatDate(u.createdAt)} · ${u.signupPlatform || '—'}`} />
              <Row k="Last active" v={u.lastActiveAt ? `${timeAgo(u.lastActiveAt)} (${formatDateTime(u.lastActiveAt)})` : 'not tracked yet'} />
              <Row k="Tier (users.tier)" v={`${u.tier}${u.isGrandfathered ? ' · grandfathered' : ''}`} />
              <Row k="Deletion" v={u.deletionStatus || 'none'} />
              <Row k="User id" v={<code className="aa-code">{u.id}</code>} />
            </div>

            <div className="aa-card">
              <h2 className="aa-card__title">Subscription</h2>
              <Row k="State" v={`${data.subscription.status}${data.subscription.source ? ` (${data.subscription.source})` : ''}`} />
              <Row k="Product" v={data.subscription.productId} />
              {data.stripeSubscription && (<>
                <Row k="Stripe status" v={data.stripeSubscription.status} />
                <Row k="Period end" v={formatDate(data.stripeSubscription.current_period_end)} />
              </>)}
              <h3 className="aa-card__subtitle">RevenueCat (live)</h3>
              {live ? (
                entitlements.length ? entitlements.map(([name, e]) => (
                  <Row key={name} k={name} v={`${e.expires_date && new Date(e.expires_date) > new Date() ? 'active' : 'expired'} · until ${formatDate(e.expires_date)} · ${e.product_identifier || ''}`} />
                )) : <p className="aa-card__hint">Customer exists, no entitlements.</p>
              ) : <p className="aa-card__hint">No RevenueCat customer for this email.</p>}
            </div>

            <div className="aa-card">
              <h2 className="aa-card__title">Feature usage</h2>
              <table className="aa-table">
                <tbody>
                  {Object.entries(data.featureCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <tr key={k}><td>{FEATURE_LABELS[k] || k}</td><td className="num">{v}</td></tr>
                  ))}
                </tbody>
              </table>
              {data.streak && <p className="aa-card__hint">Streak {data.streak.current_streak} (best {data.streak.longest_streak}) · last activity {data.streak.last_activity_date || '—'}</p>}
              {data.onboarding && <p className="aa-card__hint">Goal: {data.onboarding.primary_goal || '—'} · household {data.onboarding.household_size ?? '—'} · onboarding {data.onboarding.onboarding_completed ? 'completed' : 'incomplete'}</p>}
            </div>
          </section>

          <section className="aa-card">
            <h2 className="aa-card__title">RevenueCat events <span className="aa-card__sub">{data.revenueCatEvents.length}</span></h2>
            {data.revenueCatEvents.length ? (
              <table className="aa-table">
                <thead><tr><th>When</th><th>Event</th><th>Product</th><th>Processed</th></tr></thead>
                <tbody>
                  {data.revenueCatEvents.map((e, i) => (
                    <tr key={i}><td>{formatDateTime(e.created_at)}</td><td>{e.event_type}</td><td>{e.product_id || '—'}</td><td>{e.processed ? 'yes' : e.error_message || 'no'}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="aa-card__hint">No webhook events for this email.</p>}
          </section>
        </>
      )}
    </div>
  );
};

export default AnalyticsUserDetail;
