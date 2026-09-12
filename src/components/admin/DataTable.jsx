import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Ban,
  Inbox
} from 'lucide-react';

export default function DataTable({
  id = 'data-table',
  columns = [],
  data = [],
  totalItems,
  selectedId,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onCancel,
  onInvoice,
  actionOptions = ['view', 'edit', 'more'],
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  showPagination = true,
  tableTitle = 'Bookings List',
  extraHeaderActions
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Toggle single row selection
  const toggleSelectRow = (rowId, e) => {
    e.stopPropagation();
    const next = new Set(selectedRows);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    setSelectedRows(next);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedRows.size === data.length && data.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((d, i) => d.id || i)));
    }
  };

  const total = totalItems || data.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Render page buttons
  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div id={id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">{tableTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedRows.size > 0
              ? `${selectedRows.size} record${selectedRows.size > 1 ? 's' : ''} selected`
              : `Total ${total} entries found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {extraHeaderActions}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select
              defaultValue={pageSize}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 w-12 text-center">#</th>
              {columns.map((col) => (
                <th key={col.key} className={`py-3.5 px-4 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
              <th className="py-3.5 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = row.id || idx;
                const isSelected = selectedId === rowId;
                const isChecked = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-orange-50/50 hover:bg-orange-50/80'
                        : isChecked
                        ? 'bg-slate-50 hover:bg-slate-100/70'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectRow(rowId, e)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className={`py-3.5 px-4 ${col.className || ''}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}

                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1 relative">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* More Actions Dropdown Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                            title="More options"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === rowId && (
                            <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left">
                              {onView && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onView(row);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Details
                                </button>
                              )}

                              {onEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onEdit(row);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit Booking
                                </button>
                              )}

                              {onInvoice && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onInvoice(row);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Download Invoice
                                </button>
                              )}

                              {onCancel && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onCancel(row);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer border-t border-slate-100"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Cancel Booking
                                </button>
                              )}

                              {onDelete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDelete(row);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && data.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, total)} of {total} bookings
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {renderPaginationButtons().map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange && onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#F97316] text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
