import React, { useCallback, useEffect, useState } from 'react';
import { fetchFeedback, updateFeedback, FEEDBACK_STATUSES, formatDateTime } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, DataTable, Badge, EmptyState, ErrorState, Skeleton } from './ui';

const TABS = [
  { key: '', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'resolved', label: 'Resolved' },
];

const TONE = { new: 'info', read: 'muted', resolved: 'good' };
const PAGE_SIZE = 50;

const FeedbackPage = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => { setPage(1); }, [status]);

  const load = useCallback(() => {
    setError(null);
    fetchFeedback({ status: status || undefined, page, pageSize: PAGE_SIZE })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const onStatusChange = async (row, next) => {
    setSavingId(row.id);
    setError(null);
    try {
      await updateFeedback(row.id, next);
      // Re-fetch rather than patching locally: with a filter active the row
      // may no longer belong on this page at all.
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = [
    { key: 'createdAt', header: 'When', render: (r) => <span title={r.createdAt}>{formatDateTime(r.createdAt)}</span> },
    {
      key: 'from',
      header: 'From',
      render: (r) => (
        <>
          <div className="aa-user__email">{r.userName || '—'}</div>
          <div className="ad-muted">{r.userEmail}</div>
          {r.user && <div className="ad-muted">{r.user.tier} · {r.user.signupPlatform || '—'}</div>}
        </>
      ),
    },
    { key: 'message', header: 'Message', render: (r) => <div className="ad-feedback__msg">{r.message}</div> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={TONE[r.status] || 'muted'}>{r.status}</Badge> },
    {
      key: 'actions',
      header: 'Set status',
      render: (r) => (
        <select
          className="ad-select"
          value={r.status}
          disabled={savingId === r.id}
          onChange={(e) => onStatusChange(r, e.target.value)}
          aria-label={`Status for feedback from ${r.userEmail}`}
        >
          {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ];

  const tabs = (
    <div className="ad-segment" role="group" aria-label="Filter by status">
      {TABS.map((t) => (
        <button key={t.key || 'all'} type="button" className={status === t.key ? 'is-active' : undefined} onClick={() => setStatus(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="aa">
      <AdminPageHeader
        title="Feedback"
        actions={tabs}
        description="Submissions from the in-app support form."
      />

      {error && <ErrorState onRetry={load}>{error}</ErrorState>}

      <AdminCard title="Submissions" sub={data ? total : undefined}>
        {!data && !error && <Skeleton />}
        {data && items.length === 0 && (
          <EmptyState>{status ? `No ${status} feedback.` : 'No feedback yet.'}</EmptyState>
        )}
        {data && items.length > 0 && (
          <>
            <DataTable columns={columns} rows={items} />
            {pageCount > 1 && (
              <div className="ad-pager">
                <span>Page {page} of {pageCount} · {total} total</span>
                <button type="button" className="ad-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button type="button" className="ad-btn" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
};

export default FeedbackPage;
