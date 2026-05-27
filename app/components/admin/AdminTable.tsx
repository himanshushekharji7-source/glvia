"use client";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function AdminTable({
  columns,
  data,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "No data found",
}: AdminTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-card rounded-xl border border-border p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface-card rounded-xl border border-border p-12 text-center">
        <span className="material-icons-round text-text-tertiary text-[48px] mb-3 block">inbox</span>
        <p className="text-text-secondary text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-dim/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[11px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-3"
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="text-right text-[11px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-3 w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="border-b border-border last:border-0 hover:bg-surface-dim/40 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-text-primary">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="w-8 h-8 rounded-lg hover:bg-info/10 flex items-center justify-center transition-colors group"
                          title="Edit"
                        >
                          <span className="material-icons-round text-[16px] text-text-tertiary group-hover:text-info">
                            edit
                          </span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center transition-colors group"
                          title="Delete"
                        >
                          <span className="material-icons-round text-[16px] text-text-tertiary group-hover:text-error">
                            delete
                          </span>
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
    </div>
  );
}
