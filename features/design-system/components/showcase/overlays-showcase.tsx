import { X, Bell, Plane, AlertCircle, Info, Check, Search, Shield } from "lucide-react";
import { useState } from "react";
import { Text } from "@/shared/components/ui";

export function OverlaysShowcase() {
    const [showModal, setShowModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);

    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Overlays & Feedback</Text>
                <Text variant="base" intent="secondary">Modals, drawers, and state-full UI feedback elements.</Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    {/* Modal Trigger */}
                    <div className="space-y-4">
                        <Text variant="lg" weight="semibold" className="block">Modal Systems</Text>
                        <Text variant="sm" intent="secondary" className="block">Dialogs for focused interactions or confirmations.</Text>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-[var(--color-navy-900)] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                            Open Example Modal
                        </button>
                    </div>

                    {/* Drawer Trigger */}
                    <div className="space-y-4">
                        <Text variant="lg" weight="semibold" className="block">Slide-out Drawers</Text>
                        <Text variant="sm" intent="secondary" className="block">Side panels for filtering, menus or quick edits.</Text>
                        <button
                            onClick={() => setShowDrawer(true)}
                            className="px-6 py-3 border-2 border-[var(--color-navy-900)] text-[var(--color-navy-900)] font-bold rounded-xl hover:bg-[var(--color-navy-50)] transition-all"
                        >
                            Open Side Drawer
                        </button>
                    </div>
                </div>

                {/* Modal Preview */}
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <Text variant="h4" weight="bold">Confirm Booking</Text>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-[var(--color-yellow-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plane className="w-8 h-8 text-[var(--color-yellow-600)]" />
                                </div>
                                <Text intent="secondary" className="mb-6 block">
                                    You are about to book a flight to <Text weight="bold" intent="primary">Tokyo</Text> for <Text weight="bold" intent="primary">₦1,450,000</Text>.
                                </Text>
                                <div className="flex gap-3">
                                    <button className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="flex-1 px-6 py-3 bg-[var(--color-action-primary)] text-[var(--color-text-primary)] rounded-xl font-bold hover:shadow-lg">
                                        Confirm & Pay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drawer Preview */}
                {showDrawer && (
                    <div className="fixed inset-0 z-[200] overflow-hidden">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrawer(false)} />
                        <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl animate-slide-left p-6">
                            <div className="flex items-center justify-between mb-8">
                                <Text variant="h4" weight="bold">Filters</Text>
                                <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest block mb-3" intent="muted">Price Range</Text>
                                    <div className="h-1 bg-gray-200 rounded-full relative">
                                        <div className="absolute inset-y-0 left-0 right-1/4 bg-[var(--color-action-secondary)] rounded-full" />
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[var(--color-action-secondary)] rounded-full" />
                                        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[var(--color-action-secondary)] rounded-full" />
                                    </div>
                                    <div className="flex justify-between mt-2 font-bold">
                                        <Text variant="sm">₦0</Text>
                                        <Text variant="sm">₦4.5M</Text>
                                    </div>
                                </div>
                                <div>
                                    <Text variant="xs" weight="bold" className="uppercase tracking-widest block mb-3" intent="muted">Airlines</Text>
                                    <div className="space-y-2">
                                        {['Qatar Airways', 'Emirates', 'Air Peace', 'British Airways'].map(airline => (
                                            <label key={airline} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-[var(--color-action-secondary)] transition-colors" />
                                                <Text variant="sm" weight="medium" intent="secondary">{airline}</Text>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <button className="w-full px-6 py-4 bg-[var(--color-navy-900)] text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
