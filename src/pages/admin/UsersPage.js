import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, FEATURE_LABELS, formatDate, timeAgo } from '../../features/admin-analytics/api';
import { AdminPageHeader, AdminCard, DataTable, EmptyState, ErrorState, Skeleton } from './ui';
import { SubscriptionBadge } from './OverviewPage';

const PAGE_SIZE = 50;

const UsersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Any change to the query resets to the first page — otherwise a search
  // while on page 3 can land on an empty page.
  useEffect(() => { setPage(1); }, [search, sort]);

  const load = useCallback(() => {
    setError(null);
    fetchUsers({ search, sort, dir: 'desc', page, pageSize: PAGE_SIZE })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [search, sort, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const users = data?.users || [];

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <>
          <div className="aa-user__email">{u.email}</div>
          <div className="ad-muted">{u.firstName || '—'}{u.deletionStatus ? ` · ${u.deletionStatus}` : ''}</div>
        </>
      ),
    },
    { key: 'createdAt', header: 'Signed up', render: (u) => <span title={u.createdAt}>{formatDate(u.createdAt)}</span> },
    { key: 'signupPlatform', header: 'Platform', render: (u) => u.signupPlatform || '—' },
    { key: 'subscription', header: 'Subscription', render: (u) => <SubscriptionBadge sub={u.subscription} /> },
    { key: 'lastActiveAt', header: 'Last active', render: (u) => <span title={u.lastActiveAt || ''}>{timeAgo(u.lastActiveAt)}</span> },
    { key: 'streak', header: 'Streak', align: 'num', render: (u) => u.streak?.current_streak ?? 0 },
    {
      key: 'features',
      header: 'Uses',
      render: (u) => (
        <div className="aa-user__features">
          {Object.entries(u.features)
            .filter(([k]) => !['guided_tour', 'push_notifications'].includes(k))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([k, v]) => <span key={k} className="aa-chip">{FEATURE_LABELS[k] || k} <strong>{v}</strong></span>)}
        </div>
      ),
    },
  ];

  const controls = (
    <>
      <input
        className="ad-input"
        type="search"
        placeholder="Search email or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select className="ad-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort users">
        <option value="created_at">Newest signup</option>
        <option value="last_active_at">Recently active</option>
        <option value="email">Email</option>
      </select>
    </>
  );

  return (
    <div className="aa">
      <AdminPageHeader title="Users" actions={controls} />

      {error && <ErrorState onRetry={load}>{error}</ErrorState>}

      <AdminCard title="All users" sub={data ? total : undefined}>
        {!data && !error && <Skeleton />}
        {data && users.length === 0 && (
          <EmptyState>{search ? `No users match “${search}”.` : 'No users yet.'}</EmptyState>
        )}
        {data && users.length > 0 && (
          <>
            <DataTable
              columns={columns}
              rows={users}
              onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
            />
            <div className="ad-pager">
              <span>Page {page} of {pageCount} · {total} total</span>
              <button type="button" className="ad-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <button type="button" className="ad-btn" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                Next
              </button>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
};

export default UsersPage;
