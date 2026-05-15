import { Text } from "@/shared/components/ui";

export function BadgesShowcase() {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">
                    Badges & Tags
                </Text>
                <Text variant="base" intent="secondary">
                    Small UI elements for status, categories, and counts.
                </Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-2 gap-8">
                    {/* Status Badges */}
                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">
                            Status Badges
                        </Text>
                        <div className="flex flex-wrap gap-3">
                            <span className="bg-[var(--color-success-bg)] px-3 py-1 rounded-full border border-[var(--color-border-success)]">
                                <Text variant="xs" weight="bold" className="text-[var(--color-success-800)]">CONFIRMED</Text>
                            </span>
                            <span className="bg-[var(--color-warning-bg)] px-3 py-1 rounded-full border border-[var(--color-border-warning)]">
                                <Text variant="xs" weight="bold" className="text-[var(--color-warning-800)]">PENDING</Text>
                            </span>
                            <span className="bg-[var(--color-error-bg)] px-3 py-1 rounded-full border border-[var(--color-border-error)]">
                                <Text variant="xs" weight="bold" className="text-[var(--color-error-800)]">CANCELLED</Text>
                            </span>
                            <span className="bg-[var(--color-info-bg)] px-3 py-1 rounded-full border border-[var(--color-border-info)]">
                                <Text variant="xs" weight="bold" className="text-[var(--color-info-800)]">IN PROGRESS</Text>
                            </span>
                        </div>
                    </div>

                    {/* Category Tags */}
                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">
                            Category Tags
                        </Text>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-[var(--color-navy-100)] rounded hover:bg-[var(--color-navy-200)] transition-colors cursor-pointer">
                                <Text variant="xs" weight="medium" intent="primary">#Adventure</Text>
                            </span>
                            <span className="px-3 py-1 bg-[var(--color-navy-100)] rounded hover:bg-[var(--color-navy-200)] transition-colors cursor-pointer">
                                <Text variant="xs" weight="medium" intent="primary">#Luxury</Text>
                            </span>
                            <span className="px-3 py-1 bg-[var(--color-navy-100)] rounded hover:bg-[var(--color-navy-200)] transition-colors cursor-pointer">
                                <Text variant="xs" weight="medium" intent="primary">#Beaches</Text>
                            </span>
                            <span className="px-3 py-1 bg-[var(--color-navy-100)] rounded hover:bg-[var(--color-navy-200)] transition-colors cursor-pointer">
                                <Text variant="xs" weight="medium" intent="primary">#Couples</Text>
                            </span>
                        </div>
                    </div>

                    {/* Notification Dots */}
                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">
                            Notification Dots
                        </Text>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-error)] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                    3
                                </span>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-error)] rounded-full ring-2 ring-white" />
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-success)] rounded-full ring-2 ring-white" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Style */}
                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">
                            Step Badges
                        </Text>
                        <div className="flex items-center">
                            <span className="w-8 h-8 bg-[var(--color-action-secondary)] text-white rounded-full flex items-center justify-center">
                                <Text variant="sm" weight="bold" intent="inverse">1</Text>
                            </span>
                            <div className="w-8 h-1 bg-[var(--color-action-secondary)]" />
                            <span className="w-8 h-8 bg-[var(--color-action-secondary)] text-white rounded-full flex items-center justify-center">
                                <Text variant="sm" weight="bold" intent="inverse">2</Text>
                            </span>
                            <div className="w-8 h-1 bg-[var(--color-bg-muted)]" />
                            <span className="w-8 h-8 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center border-2 border-[var(--color-border-default)]">
                                <Text variant="sm" weight="bold" intent="muted">3</Text>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
