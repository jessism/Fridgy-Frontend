import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Megaphone, Users, Send, MessageCircle } from 'lucide-react';
import {
  fetchInfluencerToday, fetchInfluencers, fetchInfluencer, updateInfluencer,
  influencerWarmupDone, batchWarmupDone, influencerDmSent, updateInfluencerPost,
  retryInfluencerTouch, sendInfluencerEmail, sendAllInfluencerEmails,
  runInfluencerJob, formatDate, formatDateTime,
} from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, DataTable, Badge, EmptyState, ErrorState, Skeleton, StatTile } from './ui';
import './InfluencersPage.css';

/**
 * Influencer outreach: the control panel for the two-sessions-a-week flow.
 * Rows arrive from the discovery engine (trackabite-outreach); everything
 * after that happens here. Plan: MD_files/PLAN_INFLUENCER_AGENT_SPT13.md.
 */

const STATUS_LABEL = {
  pending_approval: 'Pending', warmup_needed: 'Warm-up needed', dm_needed: 'DM needed', contacted: 'Contacted',
  followup_needed: 'Follow-up needed', replied: 'Replied', signed: 'Signed', declined: 'Declined',
  no_response: 'No response', rejected: 'Rejected', hold: 'On hold', opted_out: 'Opted out', bounced: 'Bounced',
};
const TONE = {
  pending_approval: 'info', warmup_needed: 'warn', dm_needed: 'warn', contacted: 'warn', followup_needed: 'warn',
  replied: 'good', signed: 'good', declined: 'muted', no_response: 'muted', rejected: 'muted', hold: 'muted',
  opted_out: 'bad', bounced: 'bad',
};
const FUNNEL = ['pending_approval', 'warmup_needed', 'dm_needed', 'contacted', 'followup_needed', 'replied', 'signed'];
const SMALL = ['hold', 'rejected', 'no_response', 'declined', 'opted_out', 'bounced'];

const dmLink = (inf) => (inf.platform === 'instagram' ? `https://ig.me/m/${inf.handle}` : inf.profile_url);
const stepLabel = (step) => (step === 1 ? 'first contact' : `follow-up ${step - 1}`);
const money = (n) => (n == null ? '—' : `$${n}`);

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

const CopyButton = ({ text, label = 'Copy' }) => {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="ad-btn io-btn--sm" onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1500); } }}>
      {done ? 'Copied' : label}
    </button>
  );
};

const HandleLink = ({ inf }) => (
  <a className="io-link" href={inf.profile_url} target="_blank" rel="noreferrer">@{inf.handle}</a>
);

const PLATFORM_LABEL = { instagram: 'IG', tiktok: 'TikTok', youtube: 'YouTube' };

/**
 * The creator's own profile plus any other platform discovery found in their bio
 * or link-in-bio. `source: 'apify'` means the account was looked up and its
 * follower count confirmed; `'link'` is an unverified handle scraped from text,
 * so it is muted — a guess should not look like a fact.
 */
const PlatformLinks = ({ inf }) => (
  <span className="io-plat" onClick={(e) => e.stopPropagation()}>
    <a className="io-link" href={inf.profile_url} target="_blank" rel="noreferrer">{PLATFORM_LABEL[inf.platform] || inf.platform}</a>
    {(inf.other_platforms || []).map((p) => {
      const verified = p.source === 'apify' || p.followers != null;
      return (
        <a
          key={`${p.platform}-${p.handle}`}
          className={`io-link${verified ? '' : ' io-plat--unverified'}`}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          title={verified
            ? `@${p.handle}${p.followers != null ? ` · ${p.followers.toLocaleString()} followers` : ''}`
            : `@${p.handle} · found in bio, not verified`}
        >
          {PLATFORM_LABEL[p.platform] || p.platform}
        </a>
      );
    })}
  </span>
);

/* ---------- Today: warm-up cards ---------- */

/** Caption's first words make a far more useful link than a repeated "Open post". */
const postLabel = (p, n) => {
  const caption = (p.caption || '').replace(/\s+/g, ' ').trim();
  return caption ? `${caption.slice(0, 70)}${caption.length > 70 ? '…' : ''}` : `Post ${n}`;
};

/**
 * `liked_at` doubles as the "engaged" marker: the per-post ticks are a personal
 * scratchpad (nothing in the backend, scheduler or sheet mirror reads them), so
 * one checkbox is enough and both columns move together.
 */
const isEngaged = (p) => Boolean(p.liked_at);

const WarmupCard = ({ inf, onDone, onTick, onTickAll, busy }) => {
  const posts = [...(inf.influencer_posts || [])]
    .sort((a, b) => (b.posted_at || '').localeCompare(a.posted_at || ''))
    .map((p, i) => ({ ...p, n: i + 1 }));
  const allEngaged = posts.length > 0 && posts.every(isEngaged);

  const columns = [
    { key: 'n', header: '#' },
    {
      key: 'post',
      header: 'Post',
      render: (p) => (
        <a className="io-post-link" href={p.post_url} target="_blank" rel="noreferrer" title={p.caption || undefined}>
          {postLabel(p, p.n)}
        </a>
      ),
    },
    {
      key: 'engaged',
      header: 'Engaged?',
      render: (p) => (
        <input
          type="checkbox"
          aria-label={`Engaged with post ${p.n}`}
          checked={isEngaged(p)}
          onChange={(e) => onTick(inf.id, p.id, e.target.checked)}
        />
      ),
    },
  ];

  return (
    <div className="io-creator">
      <div className="io-creator__head">
        <div>
          <HandleLink inf={inf} />
          <span className="io-creator__meta">{inf.followers?.toLocaleString()} followers · score {inf.score} · {money(inf.recommended_fee)}</span>
          {(inf.other_platforms || []).length > 0 && <> <PlatformLinks inf={inf} /></>}
        </div>
        <div className="io-actions">
          <a className="ad-btn io-btn--sm" href={inf.profile_url} target="_blank" rel="noreferrer">Open profile (follow)</a>
          {posts.length > 0 && (
            <button type="button" className="ad-btn io-btn--sm" disabled={busy || allEngaged} onClick={() => onTickAll(inf, posts)}>
              {allEngaged ? 'All engaged' : 'Mark all engaged'}
            </button>
          )}
          <button type="button" className="ad-btn ad-btn--primary io-btn--sm" disabled={busy} onClick={() => onDone(inf)}>Done warming up</button>
        </div>
      </div>
      {posts.length === 0
        ? <p className="io-note">No posts captured for this creator; like and comment from their profile.</p>
        : <DataTable className="io-posts" columns={columns} rows={posts} />}
    </div>
  );
};

/* ---------- Today: DM tasks ---------- */

const DmTask = ({ touch, onSent, busy, emailPending }) => {
  const inf = touch.influencers;
  const emailNote = !inf.email ? 'no email on file, DM only'
    : emailPending ? 'email drafted below, not sent yet'
      : inf.email_error ? `email failed: ${inf.email_error}` : 'email sent ✓';
  return (
    <div className="io-dm">
      <div className="io-creator__head">
        <div>
          <HandleLink inf={inf} />
          <span className="io-creator__meta">{stepLabel(touch.step)} · {emailNote}</span>
        </div>
        <div className="io-actions">
          <a className="ad-btn io-btn--sm" href={dmLink(inf)} target="_blank" rel="noreferrer">Open DM</a>
          <CopyButton text={touch.body || ''} label="Copy DM" />
          <button type="button" className="ad-btn ad-btn--primary io-btn--sm" disabled={busy} onClick={() => onSent(inf.id)}>DM sent</button>
        </div>
      </div>
      <div className="io-dm__body">{touch.body}</div>
    </div>
  );
};

/* ---------- Today: emails waiting to be sent ---------- */

/**
 * First contact is drafted when warm-up finishes and sits here until Jessie
 * presses Send: the exact message, headers included, goes out from the
 * jessie@ mailbox without opening Gmail. Follow-ups (touch 2+) are sent by the
 * evening cron instead, and only appear here if one failed.
 */
const EmailTask = ({ touch, cfg, busy, onSend, onOpen }) => {
  const inf = touch.influencers;
  return (
    <div className="io-email">
      <div className="io-creator__head">
        <div>
          <HandleLink inf={inf} />
          <span className="io-creator__meta">
            {stepLabel(touch.step)}{touch.error ? '' : ' · drafted, not sent yet'}
          </span>
        </div>
        <div className="io-actions">
          <button type="button" className="ad-btn io-btn--sm" onClick={() => onOpen(inf.id)}>Edit</button>
          <button
            type="button"
            className="ad-btn ad-btn--primary io-btn--sm"
            disabled={busy || !cfg.emailEnabled}
            title={cfg.emailEnabled ? undefined : 'Creator email is off on the server'}
            onClick={() => onSend(touch)}
          >
            {touch.error ? 'Retry send' : 'Send email'}
          </button>
        </div>
      </div>
      {touch.error && <div className="io-error">{touch.error}</div>}
      <dl className="io-headers">
        <dt>From</dt><dd>{cfg.fromName} &lt;{cfg.fromEmail || 'not configured'}&gt;</dd>
        <dt>To</dt><dd>{inf.email}</dd>
        <dt>Subject</dt><dd>{touch.subject || <span className="io-error">no subject drafted</span>}</dd>
      </dl>
      <div className="io-dm__body">{touch.body || '(no body drafted — Edit the creator, then retry)'}</div>
    </div>
  );
};

/* ---------- Reject with a reason ---------- */

const REJECT_CHIPS = [
  'Not food or cooking content',
  'Business or restaurant account',
  'Wrong audience',
  'Too sponsored / promotional',
  'Promotes a competing app',
  'Low-quality content',
  'Inactive',
];

/**
 * The reason is not bookkeeping: discovery feeds recent reasons back into the
 * scoring prompt, so writing one here stops the same type of creator appearing
 * next run. Skipping is still one click, so a fast pass through the list is
 * never blocked.
 */
const RejectModal = ({ creator, onCancel, onReject, busy }) => {
  const [reason, setReason] = useState('');
  const addChip = (chip) => setReason((r) => (r.trim() ? `${r.trim()}; ${chip.toLowerCase()}` : chip));

  return (
    <div className="ad-modal-scrim" role="dialog" aria-modal="true" aria-label="Reject creator">
      <div className="ad-modal">
        <h2 className="ad-modal__title">Reject @{creator.handle}</h2>
        <p className="io-note">Why isn&apos;t this a fit? Gemini reads recent reasons when scoring the next batch, so similar creators stop showing up.</p>
        <div className="io-chips">
          {REJECT_CHIPS.map((c) => (
            <button type="button" key={c} className="io-chip io-chip--small" onClick={() => addChip(c)}>{c}</button>
          ))}
        </div>
        <textarea
          className="io-textarea"
          style={{ minHeight: 90 }}
          value={reason}
          autoFocus
          placeholder="e.g. dietitian clinic account, not a home cook"
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="ad-modal__actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="ad-btn" disabled={busy} onClick={onCancel}>Cancel</button>
          <div className="io-actions">
            <button type="button" className="ad-btn" disabled={busy} onClick={() => onReject('')}>Reject without reason</button>
            <button type="button" className="ad-btn ad-btn--primary" disabled={busy || !reason.trim()} onClick={() => onReject(reason.trim())}>Reject with reason</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Creator detail modal ---------- */

const DetailModal = ({ id, onClose, onChanged, onRequestReject }) => {
  const [inf, setInf] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchInfluencer(id).then((d) => {
      setInf(d);
      setForm({ draft_dm: d.draft_dm || '', draft_email_subject: d.draft_email_subject || '', draft_email: d.draft_email || '', notes: d.notes || '', agreed_fee: d.agreed_fee ?? '', email: d.email || '', rejection_reason: d.rejection_reason || '' });
    }).catch((e) => setError(e.message));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn) => {
    setSaving(true); setError(null);
    try { await fn(); load(); onChanged(); } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const setStatus = (status, extra = {}) => act(() => updateInfluencer(id, { status, ...extra }));
  const save = () => act(() => updateInfluencer(id, { ...form, agreed_fee: form.agreed_fee === '' ? null : form.agreed_fee }));

  if (!inf && !error) return <div className="ad-modal-scrim"><div className="ad-modal io-modal"><Skeleton /></div></div>;

  const fb = inf?.fee_breakdown || {};
  const touches = inf?.influencer_touches || [];
  const timeline = inf ? [
    { label: 'Discovered', at: inf.discovered_at },
    { label: 'Approved', at: inf.approved_at },
    { label: 'Warm-up done', at: inf.warmup_done_at },
    ...touches.map((t) => ({ label: `${t.channel === 'email' ? 'Email' : 'DM'} #${t.step}${t.error ? ' (failed)' : ''}`, at: t.sent_at, error: t.error, touch: t })),
    { label: 'Replied', at: inf.replied_at },
    inf.next_touch_at && !['replied', 'signed', 'declined', 'no_response', 'rejected', 'opted_out', 'bounced'].includes(inf.status)
      ? { label: 'Next follow-up', at: inf.next_touch_at, future: true } : null,
  ].filter(Boolean) : [];

  return (
    <div className="ad-modal-scrim" role="dialog" aria-modal="true" aria-label="Creator">
      <div className="ad-modal io-modal">
        {inf && (
          <>
            <div className="ad-card__head">
              <h2 className="ad-modal__title" style={{ margin: 0 }}>
                <HandleLink inf={inf} /> <Badge tone={TONE[inf.status]}>{STATUS_LABEL[inf.status]}</Badge>
              </h2>
              <button type="button" className="ad-btn io-btn--sm" onClick={onClose}>Close</button>
            </div>
            {error && <ErrorState>{error}</ErrorState>}

            <dl className="io-kv">
              <dt>Name</dt><dd>{inf.display_name || '—'}</dd>
              <dt>Followers</dt><dd>{inf.followers?.toLocaleString()} · engagement {inf.engagement_rate ?? '—'}%</dd>
              <dt>Other platforms</dt>
              <dd>{(inf.other_platforms || []).length ? inf.other_platforms.map((p) => (
                <span key={p.platform}>
                  <a className={`io-link${p.source === 'apify' || p.followers != null ? '' : ' io-plat--unverified'}`} href={p.url} target="_blank" rel="noreferrer">
                    {PLATFORM_LABEL[p.platform] || p.platform} @{p.handle}
                  </a>
                  {p.followers != null ? ` (${p.followers.toLocaleString()} followers)` : ' (found in bio, not verified)'}{' '}
                </span>
              )) : 'none found'}</dd>
              <dt>Category</dt><dd>{inf.category || '—'} · score {inf.score}</dd>
              <dt>Why</dt><dd>{inf.why}</dd>
              <dt>Evidence</dt><dd>“{inf.evidence_caption}”</dd>
              <dt>Bio</dt><dd>{inf.bio}</dd>
              <dt>Link in bio</dt><dd>{inf.external_url ? <a className="io-link" href={inf.external_url} target="_blank" rel="noreferrer">{inf.external_url}</a> : '—'}</dd>
              <dt>Recommended fee</dt>
              <dd>{money(inf.recommended_fee)} <span className="ad-muted">= ${fb.base} base × {fb.engagement_multiplier} engagement × {fb.platform_multiplier} ({fb.platforms_counted} platform{fb.platforms_counted === 1 ? '' : 's'}); + ${fb.install_bonus}/install, ${fb.paid_user_bonus}/paid user monthly</span></dd>
              <dt>Tracking link</dt><dd><code className="ad-code">{inf.tracking_link}</code></dd>
            </dl>

            <div className="ad-form-grid">
              <div className="ad-field"><label htmlFor="io-email">Email</label><input id="io-email" className="ad-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="ad-field"><label htmlFor="io-fee">Agreed fee (USD)</label><input id="io-fee" className="ad-input" type="number" min="0" step="5" value={form.agreed_fee} onChange={(e) => setForm({ ...form, agreed_fee: e.target.value })} /></div>
              <div className="ad-field ad-field--full"><label htmlFor="io-dm">DM draft</label><textarea id="io-dm" className="io-textarea" value={form.draft_dm} onChange={(e) => setForm({ ...form, draft_dm: e.target.value })} /></div>
              <div className="ad-field ad-field--full"><label htmlFor="io-subj">Email subject</label><input id="io-subj" className="ad-input" value={form.draft_email_subject} onChange={(e) => setForm({ ...form, draft_email_subject: e.target.value })} /></div>
              <div className="ad-field ad-field--full"><label htmlFor="io-em">Email draft</label><textarea id="io-em" className="io-textarea" value={form.draft_email} onChange={(e) => setForm({ ...form, draft_email: e.target.value })} /></div>
              <div className="ad-field ad-field--full"><label htmlFor="io-notes">Notes</label><textarea id="io-notes" className="io-textarea" style={{ minHeight: 60 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              {inf.status === 'rejected' && (
                <div className="ad-field ad-field--full">
                  <label htmlFor="io-rej">Rejection reason <span className="ad-muted">(read back when scoring the next batch)</span></label>
                  <textarea id="io-rej" className="io-textarea" style={{ minHeight: 60 }} value={form.rejection_reason} onChange={(e) => setForm({ ...form, rejection_reason: e.target.value })} />
                </div>
              )}
            </div>

            <div className="ad-modal__actions" style={{ justifyContent: 'space-between' }}>
              <div className="io-tools">
                {['pending_approval', 'hold'].includes(inf.status) && <button type="button" className="ad-btn ad-btn--primary" disabled={saving} onClick={() => setStatus('warmup_needed')}>Approve → warm-up</button>}
                {inf.status === 'pending_approval' && <button type="button" className="ad-btn" disabled={saving} onClick={() => setStatus('hold')}>Hold</button>}
                {['pending_approval', 'hold', 'warmup_needed'].includes(inf.status) && <button type="button" className="ad-btn io-btn--danger" disabled={saving} onClick={() => onRequestReject(inf)}>Reject</button>}
                {inf.status === 'warmup_needed' && <button type="button" className="ad-btn ad-btn--primary" disabled={saving} onClick={() => act(() => influencerWarmupDone(id))}>Done warming up</button>}
                {['dm_needed', 'followup_needed'].includes(inf.status) && <button type="button" className="ad-btn ad-btn--primary" disabled={saving} onClick={() => act(() => influencerDmSent(id))}>DM sent</button>}
                {['dm_needed', 'contacted', 'followup_needed'].includes(inf.status) && <button type="button" className="ad-btn" disabled={saving} onClick={() => setStatus('replied', { reply_channel: 'dm' })}>Mark replied</button>}
                {inf.status === 'replied' && <><button type="button" className="ad-btn ad-btn--primary" disabled={saving} onClick={() => setStatus('signed')}>Signed</button><button type="button" className="ad-btn" disabled={saving} onClick={() => setStatus('declined')}>Declined</button></>}
                {['rejected', 'hold', 'no_response', 'declined'].includes(inf.status) && <button type="button" className="ad-btn" disabled={saving} onClick={() => setStatus('pending_approval')}>Back to pending</button>}
              </div>
              <button type="button" className="ad-btn ad-btn--primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save edits'}</button>
            </div>

            <div className="io-section">
              <h3 className="io-section__title">Timeline</h3>
              <ul className="io-timeline">
                {timeline.map((t, i) => (
                  <li key={i} className={t.at && !t.future && !t.error ? 'is-done' : ''}>
                    {t.label}<span className="io-timeline__when">{t.at ? formatDateTime(t.at) : 'not yet'}</span>
                    {t.error && <div className="io-error">{t.error} <button type="button" className="ad-btn io-btn--sm" onClick={() => act(() => retryInfluencerTouch(t.touch.id))}>Retry</button></div>}
                  </li>
                ))}
              </ul>
            </div>

            {(inf.influencer_posts || []).length > 0 && (
              <div className="io-section">
                <h3 className="io-section__title">Recent posts</h3>
                <DataTable
                  className="io-posts"
                  columns={[
                    { key: 'n', header: '#' },
                    {
                      key: 'post',
                      header: 'Post',
                      render: (p) => (
                        <a className="io-post-link" href={p.post_url} target="_blank" rel="noreferrer" title={p.caption || undefined}>
                          {postLabel(p, p.n)}
                        </a>
                      ),
                    },
                    { key: 'posted_at', header: 'Posted', render: (p) => (p.posted_at ? formatDate(p.posted_at) : '—') },
                    { key: 'comment_draft', header: 'Comment draft', render: (p) => <span className="ad-muted">{p.comment_draft || '—'}</span> },
                    { key: 'engaged', header: 'Engaged?', render: (p) => (isEngaged(p) ? '✓' : '') },
                  ]}
                  rows={inf.influencer_posts.map((p, i) => ({ ...p, n: i + 1 }))}
                />
              </div>
            )}
          </>
        )}
        {!inf && error && <><ErrorState>{error}</ErrorState><button type="button" className="ad-btn" onClick={onClose}>Close</button></>}
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

const InfluencersPage = () => {
  const [today, setToday] = useState(null);
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('pending_approval');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [showWarmup, setShowWarmup] = useState(false);
  const [jobMsg, setJobMsg] = useState(null);

  const loadToday = useCallback(() => fetchInfluencerToday().then(setToday).catch((e) => setError(e.message)), []);
  const loadRows = useCallback(() => fetchInfluencers(filter).then(setRows).catch((e) => setError(e.message)), [filter]);
  const reload = useCallback(() => { setError(null); loadToday(); loadRows(); }, [loadToday, loadRows]);

  useEffect(() => { reload(); }, [reload]);

  const run = async (fn) => {
    setBusy(true); setError(null);
    try { await fn(); reload(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const counts = today?.counts || {};
  const batch = today?.batch;
  const approvedInBatch = (batch?.creators || []).length;
  const dmTasks = today?.dmTasks || [];
  const emailTasks = today?.emailTasks || [];
  const pendingEmailFor = new Set(emailTasks.map((t) => t.influencers.id));
  const cfg = today?.config || {};
  const pending = counts.pending_approval || 0;

  // One warm-up group per open batch. More than one appears when a batch from an
  // earlier session is still being warmed up.
  const warmupGroups = (today?.batches || [])
    .map((b) => ({ ...b, warmups: (b.creators || []).filter((c) => c.status === 'warmup_needed') }))
    .filter((g) => g.warmups.length > 0);

  // Tonight's batch stays shut until the whole review queue is triaged, so
  // approving doesn't drop warm-up work in front of you mid-review. Batches from
  // an earlier session were already reviewed, so they are never gated.
  const gatedGroups = warmupGroups.filter((g) => g.opened_today && pending > 0 && !showWarmup);
  const visibleGroups = warmupGroups.filter((g) => !gatedGroups.includes(g));
  const gatedCount = gatedGroups.reduce((n, g) => n + g.warmups.length, 0);

  const inProgress = ['warmup_needed', 'dm_needed', 'contacted', 'followup_needed'].reduce((n, s) => n + (counts[s] || 0), 0);
  const replyRate = useMemo(() => {
    const contacted = ['contacted', 'followup_needed', 'replied', 'signed', 'declined', 'no_response', 'opted_out'].reduce((n, s) => n + (counts[s] || 0), 0);
    const replied = (counts.replied || 0) + (counts.signed || 0) + (counts.declined || 0);
    return contacted ? `${Math.round((replied / contacted) * 100)}%` : '—';
  }, [counts]);

  const columns = [
    { key: 'handle', header: 'Creator', render: (r) => <><HandleLink inf={r} />{r.display_name ? <span className="ad-muted"> {r.display_name}</span> : null}</> },
    { key: 'followers', header: 'Followers', align: 'num', render: (r) => r.followers?.toLocaleString() ?? '—' },
    { key: 'score', header: 'Score', align: 'num' },
    { key: 'fee', header: 'Fee', align: 'num', render: (r) => (r.agreed_fee != null ? `$${r.agreed_fee} (agreed)` : money(r.recommended_fee)) },
    { key: 'platforms', header: 'Platforms', render: (r) => <PlatformLinks inf={r} /> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge> },
    { key: 'next', header: 'Next', render: (r) => (r.next_touch_at ? formatDate(r.next_touch_at) : r.replied_at ? `replied ${formatDate(r.replied_at)}` : formatDate(r.discovered_at)) },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="io-actions" onClick={(e) => e.stopPropagation()}>
          {r.status === 'pending_approval' && <>
            <button type="button" className="ad-btn ad-btn--primary io-btn--sm" disabled={busy} onClick={() => run(() => updateInfluencer(r.id, { status: 'warmup_needed' }))}>Approve</button>
            <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => run(() => updateInfluencer(r.id, { status: 'hold' }))}>Hold</button>
            <button type="button" className="ad-btn io-btn--sm io-btn--danger" disabled={busy} onClick={() => setRejecting(r)}>Reject</button>
          </>}
          {['dm_needed', 'contacted', 'followup_needed'].includes(r.status) && <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => run(() => updateInfluencer(r.id, { status: 'replied', reply_channel: 'dm' }))}>Mark replied</button>}
        </div>
      ),
    },
  ];

  // The reason column only earns its width on the rejected list.
  if (filter === 'rejected') {
    columns.splice(columns.length - 1, 0, {
      key: 'rejection_reason',
      header: 'Reason',
      render: (r) => (r.rejection_reason ? <span className="io-reason">{r.rejection_reason}</span> : <span className="ad-muted">—</span>),
    });
  }

  const runJob = (job) => run(async () => { const out = await runInfluencerJob(job); setJobMsg(`${job}: ${JSON.stringify(out)}`); });

  // One tick per post; both timestamps move together (see isEngaged).
  const tickPost = (id, postId, engaged) =>
    updateInfluencerPost(id, postId, { liked: engaged, commented: engaged })
      .then(loadToday)
      .catch((e) => setError(e.message));

  const tickAllPosts = (inf, posts) => run(() => Promise.all(
    posts.filter((p) => !p.liked_at).map((p) => updateInfluencerPost(inf.id, p.id, { liked: true, commented: true })),
  ));

  const confirmReject = (reason) => run(async () => {
    await updateInfluencer(rejecting.id, { status: 'rejected', rejection_reason: reason });
    setRejecting(null);
    setSelected(null);
  });

  return (
    <div className="aa">
      <AdminPageHeader
        title="Influencer Outreach"
        description="Two sessions a week. Each session: finish warming up the last batch, then send its DMs and emails, then approve the next 10 and start liking and commenting. Nothing is sent without you: follow-ups are drafted when they fall due and wait here to be read, edited and sent."
        actions={(
          <div className="io-tools">
            <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => runJob('followups')}>Run follow-ups now</button>
            <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => runJob('scan')}>Scan inbox</button>
            <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => runJob('digest')}>Send digest</button>
            <button type="button" className="ad-btn io-btn--sm" disabled={busy} onClick={() => runJob('mirror')}>Mirror to sheet</button>
          </div>
        )}
      />

      {error && <ErrorState onRetry={reload}>{error}</ErrorState>}
      {jobMsg && <div className="io-warn">{jobMsg}</div>}
      {today && !cfg.emailEnabled && (
        <div className="io-warn">
          Creator email is {cfg.emailConfigured ? 'configured but disabled (OUTREACH_EMAIL_ENABLED is not "true")' : 'not configured (GMAIL_SENDER / GMAIL_APP_PASSWORD missing on the server)'}. “Done warming up” will still move creators to DM needed; the email touch is recorded as failed and can be retried once email is on.
        </div>
      )}

      <div className="ad-tiles">
        <StatTile icon={Users} label="Pending approval" value={counts.pending_approval || 0} primary />
        <StatTile icon={Megaphone} label="In progress" value={inProgress} hint="warm-up → follow-ups" />
        <StatTile icon={Send} label="DMs to send" value={dmTasks.length} />
        <StatTile icon={MessageCircle} label="Reply rate" value={replyRate} hint={`${counts.replied || 0} replied · ${counts.signed || 0} signed`} />
      </div>

      <div className="io-funnel" role="tablist" aria-label="Pipeline stages">
        {FUNNEL.map((s) => (
          <button type="button" key={s} className={`io-chip${filter === s ? ' is-active' : ''}`} onClick={() => setFilter(s)}>{STATUS_LABEL[s]} <strong>{counts[s] || 0}</strong></button>
        ))}
        {SMALL.map((s) => (
          <button type="button" key={s} className={`io-chip io-chip--small${filter === s ? ' is-active' : ''}`} onClick={() => setFilter(s)}>{STATUS_LABEL[s]} <strong>{counts[s] || 0}</strong></button>
        ))}
        <button type="button" className={`io-chip io-chip--small${filter === '' ? ' is-active' : ''}`} onClick={() => setFilter('')}>All</button>
      </div>

      <AdminCard title="Today" className="io-today" sub={batch ? `batch #${batch.id} · opened ${formatDate(batch.opened_at)} · ${approvedInBatch}/${cfg.batchSize || 10} approved` : 'no open batch'}>
        {!today && <Skeleton />}
        {today && (
          <>
            {pending > 0 && (
              <div className="io-section">
                <h3 className="io-section__title">Review ({pending} left)</h3>
                <p className="io-note">
                  Approve, hold or reject all {pending} before tonight&apos;s warm-up opens
                  {approvedInBatch > 0 ? ` — ${approvedInBatch} approved so far` : ''}.
                </p>
                <div className="io-actions">
                  {filter !== 'pending_approval' && <button type="button" className="ad-btn ad-btn--primary io-btn--sm" onClick={() => setFilter('pending_approval')}>Review them</button>}
                  {gatedCount > 0 && <button type="button" className="ad-btn io-btn--sm" onClick={() => setShowWarmup(true)}>Show warm-up anyway ({gatedCount})</button>}
                </div>
              </div>
            )}

            {visibleGroups.map((g, i) => (
              <div className="io-section" key={g.id}>
                <h3 className="io-section__title">
                  {g.opened_today
                    ? `Warm-up · approved tonight (${g.warmups.length})`
                    : `Warm-up · batch #${g.id} from ${formatDate(g.opened_at)} (${g.warmups.length})`}
                  <button type="button" className="ad-btn ad-btn--primary io-btn--sm" disabled={busy} onClick={() => run(() => batchWarmupDone(g.id))}>Done warming up for all {g.warmups.length}</button>
                </h3>
                {i === 0 && <p className="io-note">Follow, like the {cfg.warmupLikes} posts, comment on {cfg.warmupComments} across the two sessions. “Done warming up” sends the email and queues the DM.</p>}
                {g.warmups.map((c) => (
                  <WarmupCard key={c.id} inf={c} busy={busy}
                    onDone={(inf) => run(() => influencerWarmupDone(inf.id))}
                    onTick={tickPost}
                    onTickAll={tickAllPosts} />
                ))}
              </div>
            ))}

            {dmTasks.length > 0 && (
              <div className="io-section">
                <h3 className="io-section__title">DMs to send ({dmTasks.length})</h3>
                {dmTasks.map((t) => (
                  <DmTask key={t.id} touch={t} busy={busy}
                    emailPending={pendingEmailFor.has(t.influencers.id)}
                    onSent={(id) => run(() => influencerDmSent(id))} />
                ))}
              </div>
            )}

            {emailTasks.length > 0 && (
              <div className="io-section">
                <h3 className="io-section__title">
                  Emails to send ({emailTasks.length})
                  {emailTasks.length > 1 && (
                    <button type="button" className="ad-btn ad-btn--primary io-btn--sm" disabled={busy || !cfg.emailEnabled}
                      onClick={() => run(async () => { const out = await sendAllInfluencerEmails(); setJobMsg(`Sent ${out.sent} email(s)${out.failed.length ? `, ${out.failed.length} failed` : ''}`); })}>
                      Send all {emailTasks.length}
                    </button>
                  )}
                </h3>
                <p className="io-note">Read them, edit if needed, then send. They go out from the jessie@ mailbox — you don&apos;t need to open Gmail.</p>
                {emailTasks.map((t) => (
                  <EmailTask key={t.id} touch={t} cfg={cfg} busy={busy}
                    onSend={(touch) => run(() => sendInfluencerEmail(touch.id))}
                    onOpen={(id) => setSelected(id)} />
                ))}
              </div>
            )}

            {(today.replies || []).length > 0 && (
              <div className="io-section">
                <h3 className="io-section__title">Replied this week ({today.replies.length})</h3>
                {today.replies.map((r) => (
                  <div key={r.id} className="io-dm">
                    <HandleLink inf={r} /> <span className="ad-muted">{r.reply_channel} · {formatDateTime(r.replied_at)}</span>
                    {' '}<button type="button" className="ad-btn io-btn--sm" onClick={() => setSelected(r.id)}>Open</button>
                  </div>
                ))}
              </div>
            )}

            {pending === 0 && warmupGroups.length === 0 && dmTasks.length === 0 && (
              <div className="io-section">
                <p className="io-note">Nothing to do tonight. The next discovery run will refill the review queue.</p>
              </div>
            )}
          </>
        )}
      </AdminCard>

      <AdminCard title={filter ? STATUS_LABEL[filter] : 'All creators'} sub={rows ? rows.length : undefined}>
        {!rows && !error && <Skeleton />}
        {rows && rows.length === 0 && <EmptyState>Nothing here.</EmptyState>}
        {rows && rows.length > 0 && <DataTable columns={columns} rows={rows} onRowClick={(r) => setSelected(r.id)} />}
      </AdminCard>

      {selected && <DetailModal id={selected} onClose={() => setSelected(null)} onChanged={reload} onRequestReject={setRejecting} />}
      {rejecting && <RejectModal creator={rejecting} busy={busy} onCancel={() => setRejecting(null)} onReject={confirmReject} />}
    </div>
  );
};

export default InfluencersPage;
