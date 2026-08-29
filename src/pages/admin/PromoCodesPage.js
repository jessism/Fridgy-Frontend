import React, { useCallback, useEffect, useState } from 'react';
import { fetchPromos, createPromo, updatePromo, formatDate } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, DataTable, Badge, EmptyState, ErrorState, Skeleton } from './ui';

const EMPTY_FORM = {
  code: '',
  stripeCouponId: '',
  discountType: 'percent',
  discountValue: '',
  duration: 'once',
  durationInMonths: '',
  maxRedemptions: '',
  expiresAt: '',
};

const NewCodeModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createPromo({
        code: form.code,
        stripeCouponId: form.stripeCouponId,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        duration: form.duration,
        // Only send these when they carry a value — the API rejects
        // durationInMonths outside `repeating`.
        ...(form.duration === 'repeating' ? { durationInMonths: Number(form.durationInMonths) } : {}),
        ...(form.maxRedemptions ? { maxRedemptions: Number(form.maxRedemptions) } : {}),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ad-modal-scrim" role="dialog" aria-modal="true" aria-label="New promo code">
      <div className="ad-modal">
        <h2 className="ad-modal__title">New promo code</h2>
        {error && <ErrorState>{error}</ErrorState>}
        <form onSubmit={submit}>
          <div className="ad-form-grid">
            <div className="ad-field">
              <label htmlFor="pc-code">Code</label>
              <input id="pc-code" className="ad-input" value={form.code} onChange={set('code')} placeholder="LAUNCH20" required />
            </div>
            <div className="ad-field">
              <label htmlFor="pc-coupon">Stripe coupon ID</label>
              <input id="pc-coupon" className="ad-input" value={form.stripeCouponId} onChange={set('stripeCouponId')} placeholder="existing coupon" required />
            </div>
            <div className="ad-field">
              <label htmlFor="pc-type">Discount type</label>
              <select id="pc-type" className="ad-select" value={form.discountType} onChange={set('discountType')}>
                <option value="percent">percent</option>
                <option value="fixed">fixed</option>
              </select>
            </div>
            <div className="ad-field">
              <label htmlFor="pc-value">Discount value</label>
              <input id="pc-value" className="ad-input" type="number" min="0" max={form.discountType === 'percent' ? 100 : undefined} step="0.01" value={form.discountValue} onChange={set('discountValue')} required />
            </div>
            <div className="ad-field">
              <label htmlFor="pc-duration">Duration</label>
              <select id="pc-duration" className="ad-select" value={form.duration} onChange={set('duration')}>
                <option value="once">once</option>
                <option value="repeating">repeating</option>
                <option value="forever">forever</option>
              </select>
            </div>
            {form.duration === 'repeating' && (
              <div className="ad-field">
                <label htmlFor="pc-months">Months</label>
                <input id="pc-months" className="ad-input" type="number" min="1" step="1" value={form.durationInMonths} onChange={set('durationInMonths')} required />
              </div>
            )}
            <div className="ad-field">
              <label htmlFor="pc-max">Max redemptions (optional)</label>
              <input id="pc-max" className="ad-input" type="number" min="1" step="1" value={form.maxRedemptions} onChange={set('maxRedemptions')} />
            </div>
            <div className="ad-field">
              <label htmlFor="pc-expires">Expires (optional)</label>
              <input id="pc-expires" className="ad-input" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
            </div>
          </div>
          <div className="ad-modal__actions">
            <button type="button" className="ad-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="ad-btn ad-btn--primary" disabled={saving}>{saving ? 'Creating…' : 'Create code'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PromoCodesPage = () => {
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError(null);
    fetchPromos().then(setCodes).catch((e) => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (row) => {
    setBusyId(row.id);
    setError(null);
    try {
      await updatePromo(row.id, { active: !row.active });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'code', header: 'Code', render: (r) => <code className="ad-code">{r.code}</code> },
    {
      key: 'discount',
      header: 'Discount',
      render: (r) => (r.discountType === 'percent' ? `${r.discountValue}%` : `$${r.discountValue}`),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (r) => (r.duration === 'repeating' ? `${r.duration} · ${r.durationInMonths}mo` : r.duration),
    },
    { key: 'timesRedeemed', header: 'Redeemed (counter)', align: 'num', render: (r) => r.timesRedeemed ?? 0 },
    { key: 'redemptions', header: 'Redemptions (recorded)', align: 'num', render: (r) => r.redemptions ?? 0 },
    { key: 'maxRedemptions', header: 'Max', align: 'num', render: (r) => r.maxRedemptions ?? '—' },
    { key: 'expiresAt', header: 'Expires', render: (r) => (r.expiresAt ? formatDate(r.expiresAt) : '—') },
    {
      key: 'active',
      header: 'Status',
      render: (r) => <Badge tone={r.active ? 'good' : 'muted'}>{r.active ? 'active' : 'inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button type="button" className="ad-btn" disabled={busyId === r.id} onClick={() => toggleActive(r)}>
          {r.active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  const counterGap = (codes || []).some((c) => (c.timesRedeemed || 0) !== (c.redemptions || 0));

  return (
    <div className="aa">
      <AdminPageHeader
        title="Promo Codes"
        actions={<button type="button" className="ad-btn ad-btn--primary" onClick={() => setShowNew(true)}>New code</button>}
        description="Stripe / web checkout only. iOS purchases use Apple offer codes, which are managed in App Store Connect."
      />

      {error && <ErrorState onRetry={load}>{error}</ErrorState>}

      <AdminCard
        title="Codes"
        sub={codes ? codes.length : undefined}
        hint={counterGap
          ? 'Heads up: “Redeemed (counter)” is the times_redeemed column the checkout bumps; “Redemptions (recorded)” counts actual user_promo_codes rows. They disagree, so treat the counter as the number the redemption limit actually enforces.'
          : undefined}
      >
        {!codes && !error && <Skeleton />}
        {codes && codes.length === 0 && <EmptyState>No promo codes yet.</EmptyState>}
        {codes && codes.length > 0 && <DataTable columns={columns} rows={codes} />}
      </AdminCard>

      {showNew && (
        <NewCodeModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
};

export default PromoCodesPage;
