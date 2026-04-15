import React, { useState, useMemo, useEffect } from "react";
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlinePlus,
  AiOutlineWarning,
} from "react-icons/ai";
import "../styles/table.css";

// ─── TYPES (backend-ready) ───
export type Column = {
  header: string;
  accessor: string;
  sortable?: boolean;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
};

export type TableProps = {
  columns: Column[];
  data: Record<string, any>[];
  rowsPerPage?: number;
  showActions?: boolean;
  onAdd?: () => void;
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (id: string) => void;
  addButtonLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

const Table: React.FC<TableProps> = ({
  columns,
  data,
  rowsPerPage = 5,
  showActions = true,
  onAdd,
  onEdit,
  onDelete,
  addButtonLabel = "+ Add",
  loading = false,
  emptyMessage = "No data found",
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // ─── SORT ───
  const handleSort = (accessor: string) => {
    setSortConfig((prev) => {
      if (prev?.key === accessor) {
        return prev.direction === "asc"
          ? { key: accessor, direction: "desc" }
          : null;
      }
      return { key: accessor, direction: "asc" };
    });
  };

  // ─── FILTER + SORT + PAGINATE ───
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (search) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          val?.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortConfig]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const totalResults = processedData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedData = useMemo(() => {
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, startIndex, rowsPerPage]);

  // ─── DELETE WITH CONFIRM ───
  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm && onDelete) {
      onDelete(deleteConfirm);
    }
    setDeleteConfirm(null);
  };

  // ─── PAGINATION RANGE (smart page numbers) ───
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  // ─── RENDER CELL ───
  const renderCell = (col: Column, row: Record<string, any>) => {
    if (col.render) {
      return col.render(row[col.accessor], row);
    }

    const value = row[col.accessor];

    // Auto-detect status badges
    if (col.accessor === "status" && typeof value === "string") {
      return (
        <span className={`table-badge table-badge-${value.toLowerCase()}`}>
          {value}
        </span>
      );
    }

    // Auto-detect amounts
    if (col.accessor === "amount" && typeof value === "number") {
      return `$${value.toLocaleString()}`;
    }

    return value;
  };

  return (
    <div className="table-wrapper">
      {/* ── TOP BAR ── */}
      <div className="table-top">
        <div className="table-search-wrapper">
          <AiOutlineSearch className="table-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="table-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {search && (
            <button
              className="table-search-clear"
              onClick={() => setSearch("")}
            >
              <AiOutlineClose />
            </button>
          )}
        </div>

        <div className="table-top-right">
          <span className="table-results-count">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </span>

          {showActions && onAdd && (
            <button className="table-add-btn" onClick={onAdd}>
              <AiOutlinePlus />
              <span>{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={col.sortable !== false ? "table-th-sortable" : ""}
                  onClick={() =>
                    col.sortable !== false && handleSort(col.accessor)
                  }
                >
                  <div className="table-th-content">
                    <span>{col.header}</span>
                    {col.sortable !== false && sortConfig?.key === col.accessor && (
                      <span className="table-sort-icon">
                        {sortConfig.direction === "asc" ? (
                          <AiOutlineSortAscending />
                        ) : (
                          <AiOutlineSortDescending />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && <th className="table-th-actions">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {/* Loading skeleton */}
            {loading &&
              [...Array(rowsPerPage)].map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.accessor}>
                      <div className="table-skeleton" />
                    </td>
                  ))}
                  {showActions && (
                    <td>
                      <div className="table-skeleton table-skeleton-sm" />
                    </td>
                  )}
                </tr>
              ))}

            {/* Empty state */}
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="table-empty"
                >
                  <div className="table-empty-content">
                    <AiOutlineSearch className="table-empty-icon" />
                    <p>{emptyMessage}</p>
                    {search && (
                      <button
                        className="table-empty-clear"
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              paginatedData.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map((col) => (
                    <td key={col.accessor}>{renderCell(col, row)}</td>
                  ))}

                  {showActions && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <button
                            className="table-action-btn table-action-edit"
                            onClick={() => onEdit(row)}
                            title="Edit"
                          >
                            <AiOutlineEdit />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="table-action-btn table-action-delete"
                            onClick={() => handleDeleteClick(row.id)}
                            title="Delete"
                          >
                            <AiOutlineDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="table-pagination-info">
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalResults)} of{" "}
            {totalResults}
          </span>

          <div className="table-pagination-controls">
            <button
              className="table-page-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPageNumbers().map((page, i) =>
              typeof page === "string" ? (
                <span key={`ellipsis-${i}`} className="table-page-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`table-page-btn ${
                    currentPage === page ? "table-page-active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              className="table-page-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirm && (
        <div className="table-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="table-modal" onClick={(e) => e.stopPropagation()}>
            <div className="table-modal-icon-wrapper">
              <AiOutlineWarning className="table-modal-icon" />
            </div>
            <h3 className="table-modal-title">Confirm Delete</h3>
            <p className="table-modal-text">
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>
            <div className="table-modal-actions">
              <button
                className="table-modal-btn table-modal-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="table-modal-btn table-modal-confirm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;