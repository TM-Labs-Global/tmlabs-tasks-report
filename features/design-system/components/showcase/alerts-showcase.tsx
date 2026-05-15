import { Check, AlertCircle, Info, X } from "lucide-react";
import { useState } from "react";
import { Text } from "@/shared/components/ui";

export function AlertsShowcase() {
    const [toastVisible, setToastVisible] = useState({
        success: false,
        error: false,
    });

    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Alerts & Notifications</Text>
                <Text variant="base" intent="secondary">
                    User feedback, system messages, and feedback components.
                </Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                {/* Banner Alerts */}
                <div>
                    <Text variant="lg" weight="semibold" className="mb-4 block">Banner Alerts</Text>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-success-bg)] border border-[var(--color-border-success)] rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--color-success)] shadow-sm">
                                <Check className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <Text weight="semibold" className="block text-[var(--color-success-800)]">Booking Successful!</Text>
                                <Text variant="sm" className="opacity-80 block text-[var(--color-success-800)]">Your flight to Dubai has been confirmed. Check your email for details.</Text>
                            </div>
                            <button className="text-[var(--color-success-800)] opacity-50 hover:opacity-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-[var(--color-warning-bg)] border border-[var(--color-border-warning)] rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--color-warning)] shadow-sm">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <Text weight="semibold" className="block text-[var(--color-warning-800)]">Payment Pending</Text>
                                <Text variant="sm" className="opacity-80 block text-[var(--color-warning-800)]">We are awaiting confirmation from your bank. This may take up to 24 hours.</Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Alerts */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Text variant="lg" weight="semibold" className="mb-4 block">Inline Alerts</Text>
                        <div className="p-3 bg-[var(--color-error-bg)] text-[var(--color-error-800)] rounded-lg flex items-center gap-2 border border-[var(--color-border-error)]">
                            <AlertCircle className="w-4 h-4" />
                            <Text variant="sm">Invalid passport number provided</Text>
                        </div>
                        <div className="p-3 bg-[var(--color-info-bg)] text-[var(--color-info-800)] rounded-lg flex items-center gap-2 border border-[var(--color-border-info)]">
                            <Info className="w-4 h-4" />
                            <Text variant="sm">Prices are subject to change based on availability</Text>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Text variant="lg" weight="semibold" className="mb-4 block">Toast Previews</Text>
                        <div className="space-y-3">
                            <button
                                onClick={() => setToastVisible({ ...toastVisible, success: true })}
                                className="w-full px-4 py-2 bg-[var(--color-action-secondary)] text-white rounded-lg text-sm font-medium"
                            >
                                Trigger Success Toast
                            </button>
                            <button
                                onClick={() => setToastVisible({ ...toastVisible, error: true })}
                                className="w-full px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg text-sm font-medium"
                            >
                                Trigger Error Toast
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Overlays */}
            <div className="fixed bottom-8 right-8 z-[100] space-y-4">
                {toastVisible.success && (
                    <div className="flex items-center gap-3 bg-[var(--color-navy-900)] p-4 rounded-xl shadow-2xl animate-slide-up min-w-[300px]">
                        <Check className="w-5 h-5 text-[var(--color-action-primary)]" />
                        <Text variant="sm" weight="medium" className="flex-1" intent="inverse">Profile updated successfully!</Text>
                        <button onClick={() => setToastVisible({ ...toastVisible, success: false })}>
                            <X className="w-4 h-4 opacity-50 text-white" />
                        </button>
                    </div>
                )}
                {toastVisible.error && (
                    <div className="flex items-center gap-3 bg-[var(--color-error-800)] p-4 rounded-xl shadow-2xl animate-slide-up min-w-[300px]">
                        <AlertCircle className="w-5 h-5 text-white" />
                        <Text variant="sm" weight="medium" className="flex-1" intent="inverse">Failed to save changes.</Text>
                        <button onClick={() => setToastVisible({ ...toastVisible, error: false })}>
                            <X className="w-4 h-4 opacity-50 text-white" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
