import { cn } from "@/lib/utils";

export function Section({ title, subtitle, action, icon, children }: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-indigo-100">
            <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">{title}</h2>
                        {subtitle && (
                            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
                        )}
                    </div>
                </div>
                {action}
            </header>
            {children}
        </section>
    );
}

export function GradientCard({ title, subtitle, accent, icon: Icon }: {
    title: string;
    subtitle: string;
    accent: string;
    icon?: any;
}) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                accent,
            )}
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80">{subtitle}</p>
                    {Icon && <Icon className="h-5 w-5 text-white/60" />}
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white">{title}</p>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-cursor-pointer hover:bg-white/20" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-xl" />
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
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={cn("px-6 py-3", column.className)}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {rows.map((row, idx) => (
                        <tr
                            key={idx}
                            className="group transition-colors duration-200 cursor-pointer hover:bg-slate-50/80"
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
