import { Search } from "lucide-react";
import { Text } from "@/shared/components/ui";

export function BrandVoiceShowcase() {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Brand Voice</Text>
                <Text variant="base" intent="secondary">Representing Juyonna Travels through copy and visual pairing.</Text>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Pairing Example */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-48 relative overflow-hidden bg-gray-200">
                        <img
                            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop"
                            className="w-full h-full object-cover"
                            alt="Beach"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-8 text-center">
                            <div className="space-y-2">
                                <Text
                                    variant="4xl"
                                    intent="inverse"
                                    className="block"
                                    style={{ fontFamily: '"Brush Script MT", cursive' }}
                                >
                                    Your Summer Escape
                                </Text>
                                <Text
                                    variant="sm"
                                    weight="semibold"
                                    className="tracking-widest uppercase block text-[var(--color-sky-300)]"
                                >
                                    UNFORGETTABLE MEMORIES
                                </Text>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <Text variant="base" weight="semibold" className="mb-2 block">Typography Pairing</Text>
                        <Text variant="sm" intent="secondary" className="block">
                            Combine TAHU (Display) for emotion with Poppins (Utility) for clarity.
                            Always maintain a 1:3 ratio of decorative to clean text.
                        </Text>
                    </div>
                </div>

                {/* Success Copy */}
                <div className="bg-[var(--color-info-bg)] border border-[var(--color-info-300)] rounded-xl p-8 flex flex-col justify-center">
                    <Text variant="sm" weight="bold" className="uppercase tracking-widest mb-4 block text-[var(--color-info-800)]">
                        TONE OF VOICE
                    </Text>
                    <Text variant="3xl" weight="bold" className="mb-4 block text-[var(--color-navy-900)]">
                        "Your journey starts here, and we're with you every mile."
                    </Text>
                    <Text intent="secondary" className="italic block text-[var(--color-navy-700)] opacity-80">
                        Keywords: Trustworthy, Adventurous, Seamless, Premium.
                    </Text>
                </div>
            </div>

            {/* Empty States */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                </div>
                <Text variant="h3" weight="bold" className="mb-2 block">No bookings found</Text>
                <Text intent="secondary" className="max-w-sm mx-auto mb-8 block">
                    Adventure is calling! You haven't made any bookings yet. Start exploring our top destinations.
                </Text>
                <button className="px-6 py-3 bg-[var(--color-action-primary)] text-[var(--color-text-primary)] font-semibold rounded-lg hover:shadow-lg transition-all">
                    Explore Destinations
                </button>
            </div>
        </section>
    );
}
