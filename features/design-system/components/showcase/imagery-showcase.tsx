import { Text } from "@/shared/components/ui";

export function ImageryShowcase() {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Imagery & Styles</Text>
                <Text variant="base" intent="secondary">Visual treatments and assets used across the platform.</Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">Gradients</Text>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-gradient-to-br from-[var(--color-navy-700)] to-[var(--color-navy-900)] rounded-xl flex items-end p-3">
                                <Text variant="xs" weight="medium" intent="inverse">Navy Deep</Text>
                            </div>
                            <div className="h-24 bg-gradient-to-br from-[var(--color-sky-400)] to-[var(--color-ocean-600)] rounded-xl flex items-end p-3">
                                <Text variant="xs" weight="medium" intent="inverse">Sky to Ocean</Text>
                            </div>
                            <div className="h-24 bg-gradient-to-br from-[var(--color-yellow-400)] to-[var(--color-orange-500)] rounded-xl flex items-end p-3">
                                <Text variant="xs" weight="medium" intent="primary">Sunset Glow</Text>
                            </div>
                            <div className="h-24 bg-gradient-to-br from-[var(--color-ocean-400)] via-[var(--color-sky-300)] to-[var(--color-yellow-200)] rounded-xl flex items-end p-3">
                                <Text variant="xs" weight="medium" className="text-[var(--color-navy-900)]">Horizon</Text>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Text variant="lg" weight="semibold" className="mb-4 block">Overlay Patterns</Text>
                        <div className="space-y-4">
                            <div className="h-24 relative rounded-xl overflow-hidden group">
                                <img
                                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&fit=crop"
                                    className="w-full h-full object-cover"
                                    alt="Pattern"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy-900)] to-transparent" />
                                <div className="absolute inset-0 flex items-center px-6">
                                    <Text weight="bold" intent="inverse">Linear Fade</Text>
                                </div>
                            </div>
                            <div className="h-24 relative rounded-xl overflow-hidden group">
                                <img
                                    src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=400&fit=crop"
                                    className="w-full h-full object-cover"
                                    alt="Pattern"
                                />
                                <div className="absolute inset-0 bg-[var(--color-navy-900)]/40 backdrop-blur-[2px]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Text weight="bold" intent="inverse">Glass & Blur</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
