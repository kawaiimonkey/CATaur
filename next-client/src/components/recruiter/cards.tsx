import { cn } from "@/lib/utils";

export function Section({ title, subtitle, action, icon, children }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-flat-primary text-white">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function GradientCard({ title, subtitle, accent }: {
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl px-5 py-5 text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        accent,
      )}
    >
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/90">{subtitle}</p>
        <p className="mt-2 text-2xl font-bold">{title}</p>
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: Array<{ key: string; label: string; className?: string }>;
  rows: Array<Record<string, React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={cn("px-6 py-3", column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="border-t border-slate-100 transition-colors duration-150 cursor-pointer hover:bg-slate-50"
            >
              {columns.map((column) => (
                <td key={column.key} className={cn("px-6 py-4 text-slate-700", column.className)}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
