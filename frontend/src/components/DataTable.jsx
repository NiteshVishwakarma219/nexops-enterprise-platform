/**
 * Generic enterprise data table used by every module.
 * Supports: search, column sorting, pagination, filter slot, row actions.
 *
 * columns: [{ key, label, sortable, render(row) }]
 * actions: (row) => ReactNode  - rendered in the trailing "Actions" column
 */
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Loader from './Loader'
import EmptyState from './EmptyState'

export default function DataTable({
  columns, rows, isLoading, error, search, onSearchChange, searchPlaceholder = 'Search...',
  sort, onSort, page, totalPages, onPageChange, total, filters, actions, emptyTitle, emptyDescription,
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-surface-border">
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="input-field pl-9"
            />
          </div>
        )}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        {total !== undefined && (
          <span className="sm:ml-auto text-xs text-slate-500 whitespace-nowrap">{total} total records</span>
        )}
      </div>

      {isLoading ? (
        <Loader label="Loading records..." />
      ) : error ? (
        <div className="p-8 text-center text-sm text-red-400">{error}</div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle || 'No records found'} description={emptyDescription || 'Try adjusting your search or filters.'} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 font-medium text-slate-400 whitespace-nowrap">
                    {col.sortable ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-slate-200 transition"
                        onClick={() => onSort?.(col.key)}
                      >
                        {col.label}
                        {sort?.sort_by === col.key ? (
                          sort.sort_dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronDown size={14} className="opacity-0 group-hover:opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                {actions && <th className="text-right px-4 py-3 font-medium text-slate-400">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id ?? idx} className="border-b border-surface-border/60 last:border-0 hover:bg-white/[0.02] transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary !px-2.5 !py-1.5"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn-secondary !px-2.5 !py-1.5"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
