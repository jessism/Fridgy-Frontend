import React, { useCallback, useEffect, useState } from 'react';
import { Radar, Inbox, CheckCircle2, CalendarDays } from 'lucide-react';
import {
  fetchRedditStats, fetchRedditOpportunities, updateRedditOpportunity, draftRedditReply,
  fetchRedditTemplates, createRedditTemplate, updateRedditTemplate, deleteRedditTemplate,
  runRedditJob, timeAgo,
} from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, StatTile, Badge, EmptyState, ErrorState, Skeleton, DataTable } from './ui';
import './RedditPage.css';

const TABS = [
  { key: '', label: 'Inbox' },
  { key: 'replied', label: 'Replied' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'filtered', label: 'Filtered' },
];

const scoreTone = (score, cfg) => {
  if (score == null) return 'muted';
  if (score >= (cfg?.alertScore ?? 75)) return 'good';
  if (score >= (cfg?.keepScore ?? 40)) return 'info';
  return 'muted';
};

/** Copy button that flips its label briefly so the click visibly worked. */
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy the reply:', text); // clipboard API blocked — fall back
    }
  };
  return (
    <button type="button" className="ad-btn" onClick={onCopy}>{copied ? 'Copied ✓' : label}</button>
  );
};

const Opportunity = ({ opp, cfg, busy, onStatus, onDraft }) => (
  <article className="rd-opp">
    <div className="rd-opp__top">
      <Badge tone={scoreTone(opp.score, cfg)}>{opp.score == null ? 'unscored' : opp.score}</Badge>
      <a className="rd-opp__title" href={opp.reddit_url} target="_blank" rel="noopener noreferrer">
        {opp.title || opp.reddit_url}
      </a>
    </div>
    <div className="ad-muted rd-opp__meta">
      r/{opp.subreddit} · {opp.kind || 'post'} · matched “{opp.keyword || '—'}” · {timeAgo(opp.created_at)}
      {opp.category ? ` · ${opp.category}` : ''}
    </div>
    {opp.score_reason && <p className="rd-opp__reason">{opp.score_reason}</p>}
    {opp.excerpt && <p className="rd-opp__excerpt">“{opp.excerpt}”</p>}
    {opp.suggested_reply && <div className="rd-reply">{opp.suggested_reply}</div>}
    <div className="rd-actions">
      {opp.suggested_reply && <CopyButton text={opp.suggested_reply} label="Copy reply" />}
      <button type="button" className="ad-btn" disabled={busy} onClick={() => onDraft(opp)}>
        {opp.suggested_reply ? 'Redraft' : 'Draft reply'}
      </button>
      {opp.status !== 'replied' && (
        <button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={() => onStatus(opp, 'replied')}>
          Mark replied
        </button>
      )}
      {opp.status === 'new' && (
        <button type="button" className="ad-btn" disabled={busy} onClick={() => onStatus(opp, 'dismissed')}>
          Dismiss
        </button>
      )}
      {opp.status !== 'new' && (
        <button type="button" className="ad-btn" disabled={busy} onClick={() => onStatus(opp, 'new')}>
          Back to inbox
        </button>
      )}
    </div>
  </article>
);

const TemplateRow = ({ tpl, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(tpl.body);
  return (
    <div className="rd-template">
      <div className="rd-opp__top">
        <span className="rd-template__name">{tpl.name}</span>
        {tpl.category && <Badge tone="muted">{tpl.category}</Badge>}
      </div>
      {editing ? (
        <>
          <textarea className="rd-textarea" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="rd-actions">
            <button type="button" className="ad-btn ad-btn--primary" onClick={() => { onSave(tpl, body); setEditing(false); }}>Save</button>
            <button type="button" className="ad-btn" onClick={() => { setBody(tpl.body); setEditing(false); }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="rd-reply">{tpl.body}</div>
          <div className="rd-actions">
            <CopyButton text={tpl.body} />
            <button type="button" className="ad-btn" onClick={() => setEditing(true)}>Edit</button>
            <button
              type="button"
              className="ad-btn"
              onClick={() => { if (window.confirm(`Delete template “${tpl.name}”?`)) onDelete(tpl); }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const RedditPage = () => {
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [opps, setOpps] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [newTpl, setNewTpl] = useState({ name: '', body: '' });

  const load = useCallback(() => {
    setError(null);
    Promise.all([
      fetchRedditStats(),
      fetchRedditOpportunities({ status: status || undefined }),
      fetchRedditTemplates(),
    ])
      .then(([s, o, t]) => { setStats(s); setOpps(o); setTemplates(t); })
      .catch((e) => setError(e.message));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, fn) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const onStatus = (opp, next) => act(opp.id, () => updateRedditOpportunity(opp.id, { status: next }));
  const onDraft = (opp) => act(opp.id, () => draftRedditReply(opp.id));

  const onCheckNow = async () => {
    setChecking(true);
    setError(null);
    try {
      await runRedditJob('ingest');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  const onSaveTemplate = (tpl, body) => act(tpl.id, () => updateRedditTemplate(tpl.id, { body }));
  const onDeleteTemplate = (tpl) => act(tpl.id, () => deleteRedditTemplate(tpl.id));
  const onCreateTemplate = () => {
    if (!newTpl.name.trim() || !newTpl.body.trim()) return;
    act('new-template', async () => {
      await createRedditTemplate({ name: newTpl.name.trim(), body: newTpl.body.trim() });
      setNewTpl({ name: '', body: '' });
    });
  };

  const counts = stats?.counts || {};
  const cfg = stats?.config;

  const actions = (
    <>
      <div className="ad-segment" role="group" aria-label="Filter by status">
        {TABS.map((t) => (
          <button key={t.key || 'inbox'} type="button" className={status === t.key ? 'is-active' : undefined} onClick={() => setStatus(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <button type="button" className="ad-btn" disabled={checking} onClick={onCheckNow}>
        {checking ? 'Checking…' : 'Check now'}
      </button>
    </>
  );

  return (
    <div className="aa">
      <AdminPageHeader
        title="Reddit Opportunities"
        actions={actions}
        description={`Threads where Trackabite fits as an answer, from F5Bot keyword alerts${cfg ? ` (mailbox ${cfg.mailbox}; alerts email at score ≥ ${cfg.alertScore})` : ''}.`}
      />

      {error && <ErrorState onRetry={load}>{error}</ErrorState>}

      <div className="ad-tiles">
        <StatTile icon={Inbox} label="In the inbox" value={counts.new ?? '—'} primary />
        <StatTile icon={CalendarDays} label="This week" value={stats?.thisWeek ?? '—'} hint="kept after filtering" />
        <StatTile icon={CheckCircle2} label="Replied" value={counts.replied ?? '—'} />
        <StatTile icon={Radar} label="Awaiting score" value={stats?.unscored ?? '—'} hint="scored every 15 min" />
      </div>

      <AdminCard title={TABS.find((t) => t.key === status)?.label || 'Inbox'} sub={opps ? opps.length : undefined}>
        {!opps && !error && <Skeleton />}
        {opps && opps.length === 0 && (
          <EmptyState>
            {status ? `Nothing ${status}.` : 'No opportunities yet — they appear here as F5Bot alerts come in.'}
          </EmptyState>
        )}
        {opps && opps.map((opp) => (
          <Opportunity key={opp.id} opp={opp} cfg={cfg} busy={busyId === opp.id} onStatus={onStatus} onDraft={onDraft} />
        ))}
      </AdminCard>

      {stats?.keywords?.length > 0 && (
        <AdminCard
          title="Keyword performance"
          hint="Hits and scores per F5Bot keyword. After a week or two, swap the weakest keyword on f5bot.com — no deploy needed."
        >
          <DataTable
            columns={[
              { key: 'keyword', header: 'Keyword', render: (r) => <strong>{r.keyword}</strong> },
              { key: 'hits', header: 'Hits', render: (r) => r.hits },
              { key: 'kept', header: 'Kept', render: (r) => `${r.kept} (${r.hits ? Math.round((100 * r.kept) / r.hits) : 0}%)` },
              { key: 'avgScore', header: 'Avg score', render: (r) => (r.avgScore == null ? '—' : <Badge tone={scoreTone(r.avgScore, cfg)}>{r.avgScore}</Badge>) },
            ]}
            rows={stats.keywords}
          />
        </AdminCard>
      )}

      <AdminCard
        title="Reply templates"
        sub={templates ? templates.length : undefined}
        hint="Starters to copy and personalize — always edit before posting, and keep the founder disclosure."
      >
        {!templates && !error && <Skeleton />}
        {templates && templates.map((tpl) => (
          <TemplateRow key={tpl.id} tpl={tpl} onSave={onSaveTemplate} onDelete={onDeleteTemplate} />
        ))}
        <div className="rd-new-template">
          <input
            className="ad-input"
            placeholder="New template name"
            value={newTpl.name}
            onChange={(e) => setNewTpl((v) => ({ ...v, name: e.target.value }))}
          />
          <textarea
            className="rd-textarea"
            placeholder="Template body"
            value={newTpl.body}
            onChange={(e) => setNewTpl((v) => ({ ...v, body: e.target.value }))}
          />
          <div>
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              disabled={!newTpl.name.trim() || !newTpl.body.trim() || busyId === 'new-template'}
              onClick={onCreateTemplate}
            >
              Add template
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
};

export default RedditPage;
