import { Plane, MoreHorizontal, ChevronLeft, ChevronRight, Filter, Sliders } from "lucide-react";
import { Text } from "@/shared/components/ui";

export function DataTablesShowcase() {
    const tableData = [
        { id: 'JT-7281', traveler: 'Adebayo Chen', destination: 'Tokyo, Japan', date: 'Oct 24, 2026', amount: '₦1,450,000', status: 'Confirmed' },
        { id: 'JT-7282', traveler: 'Sarah Ibrahim', destination: 'London, UK', date: 'Oct 26, 2026', amount: '₦980,000', status: 'Pending' },
        { id: 'JT-7283', traveler: 'Chidi Okafor', destination: 'Dubai, UAE', date: 'Oct 28, 2026', amount: '₦1,200,000', status: 'Cancelled' },
        { id: 'JT-7284', traveler: 'Emeka Nwosu', destination: 'Paris, France', date: 'Nov 02, 2026', amount: '₦2,100,000', status: 'Confirmed' },
    ];

    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Data Tables</Text>
                <Text variant="base" intent="secondary">Complex data representation for admin and booking management.</Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <Text variant="sm" weight="medium">Filter</Text>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                            <Sliders className="w-4 h-4 text-gray-500" />
                            <Text variant="sm" weight="medium">Sort</Text>
                        </button>
                    </div>
                    <Text variant="sm" weight="medium" intent="muted">
                        Displaying 4 of 128 bookings
                    </Text>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Booking ID</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Traveler</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Destination</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Travel Date</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Amount</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100">
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest" intent="muted">Status</Text>
                                </th>
                                <th className="px-6 py-4 border-b border-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tableData.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Text variant="xs" weight="bold" className="font-mono bg-[var(--color-navy-50)] px-2 py-1 rounded text-[var(--color-navy-700)]">
                                            {row.id}
                                        </Text>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-sky-300)] flex items-center justify-center text-[var(--color-navy-900)] font-bold text-xs">
                                                {row.traveler.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <Text weight="semibold">{row.traveler}</Text>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Text variant="sm" intent="secondary">{row.destination}</Text>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Text variant="sm" intent="secondary">{row.date}</Text>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Text variant="sm" weight="bold">{row.amount}</Text>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full border ${row.status === 'Confirmed' ? 'bg-[var(--color-success-bg)] border-[var(--color-border-success)]' :
                                            row.status === 'Pending' ? 'bg-[var(--color-warning-bg)] border-[var(--color-border-warning)]' :
                                                'bg-[var(--color-error-bg)] border-[var(--color-border-error)]'
                                            }`}>
                                            <Text variant="xs" weight="bold" className="uppercase" style={{ color: row.status === 'Confirmed' ? 'var(--color-success-800)' : row.status === 'Pending' ? 'var(--color-warning-800)' : 'var(--color-error-800)' }}>
                                                {row.status}
                                            </Text>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <Text variant="sm" intent="muted">Page 1 of 32</Text>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg disabled:opacity-30" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-[var(--color-navy-100)] rounded-lg">
                            <Text variant="sm" weight="bold" className="text-[var(--color-navy-900)]">1</Text>
                        </button>
                        <button className="px-3 py-1">
                            <Text variant="sm" weight="medium" intent="muted">2</Text>
                        </button>
                        <button className="px-3 py-1">
                            <Text variant="sm" weight="medium" intent="muted">3</Text>
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
