import React from 'react';

/**
 * Thin table wrapper: horizontal scroll lives INSIDE the table, so a wide
 * table never makes the page itself scroll sideways.
 *
 * columns: [{ key, header, align?: 'num', render?: (row) => node }]
 */
const DataTable = ({ columns, rows, rowKey = (r, i) => r.id ?? i, onRowClick, className = '' }) => (
  <div className="ad-table-wrap">
    <table className={`ad-table ${className}`.trim()}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={c.align === 'num' ? 'num' : undefined}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={rowKey(row, i)}
            className={onRowClick ? 'ad-row--link' : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((c) => (
              <td key={c.key} className={c.align === 'num' ? 'num' : undefined}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
