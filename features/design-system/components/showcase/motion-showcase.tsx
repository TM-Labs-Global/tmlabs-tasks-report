import { Plane } from "lucide-react";
import { Text } from "@/shared/components/ui";

export function MotionShowcase() {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Motion & Animation</Text>
                <Text variant="base" intent="secondary">Dynamic interactions that make the plateforme feel alive.</Text>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Hover Effects */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <Text variant="xs" weight="semibold" className="uppercase tracking-wider block" intent="muted">Hover Transitions</Text>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 border border-transparent rounded-lg hover:border-[var(--color-sky-300)] hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group">
                            <Text weight="semibold" className="group-hover:text-[var(--color-action-secondary)] block">Lift & Shadow</Text>
                            <Text variant="xs" intent="secondary" className="block">Smooth translate-y and shadow-md</Text>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                            <Text weight="semibold" className="block" intent="primary">Scale Up</Text>
                            <Text variant="xs" intent="secondary" className="block">Subtle 1.05x scale for cards</Text>
                        </div>
                    </div>
                </div>

                {/* Loading States */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <Text variant="xs" weight="semibold" className="uppercase tracking-wider block" intent="muted">Loading Animations</Text>
                    <div className="flex flex-col items-center justify-center h-32 space-y-6">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-[var(--color-action-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-3 h-3 bg-[var(--color-action-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-3 h-3 bg-[var(--color-action-primary)] rounded-full animate-bounce" />
                        </div>
                        <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
                                style={{ width: '200%', backgroundSize: '50% 100%' }} />
                        </div>
                    </div>
                </div>

                {/* Path Animation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <Text variant="xs" weight="semibold" className="uppercase tracking-wider block" intent="muted">Interactive Feedback</Text>
                    <button className="w-full h-32 bg-[var(--color-navy-900)] rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[var(--color-action-primary)] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <div className="relative z-10 flex flex-col items-center group-hover:text-[var(--color-text-primary)] transition-colors duration-500">
                            <Plane className="w-8 h-8 mb-2 animate-pulse text-white group-hover:text-[var(--color-text-primary)]" />
                            <Text weight="bold" intent="inverse" className="group-hover:text-inherit">Book Your Trip</Text>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
}
