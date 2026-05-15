import { Text } from "@/shared/components/ui";
import type { TypographyToken } from "@/shared/utils/design-tokens";

interface TypographyShowcaseProps {
    typography: TypographyToken[];
}

export function TypographyShowcase({ typography }: TypographyShowcaseProps) {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Typography</Text>
                <Text variant="base" intent="secondary">
                    Poppins for all UI content. TAHU decorative font for hero statements only.
                </Text>
            </div>

            {/* Font Family Info */}
            <div className="bg-gradient-to-r from-[var(--color-navy-700)] to-[var(--color-navy-600)] rounded-xl p-6 text-white">
                <Text variant="lg" weight="semibold" className="mb-4 block" intent="inverse">Font Families</Text>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Text variant="xs" weight="semibold" className="mb-2 block text-[var(--color-sun-500)]">
                            PRIMARY: POPPINS
                        </Text>
                        <Text variant="sm" className="block text-[var(--color-sky-400)]">
                            Body, UI labels, form fields, card titles, buttons, navigation
                        </Text>
                        <Text variant="2xl" weight="semibold" className="mt-3 block">Aa Bb Cc 123</Text>
                    </div>
                    <div>
                        <Text variant="xs" weight="semibold" className="mb-2 block text-[var(--color-sun-500)]">
                            DECORATIVE: TAHU
                        </Text>
                        <Text variant="sm" className="block text-[var(--color-sky-400)]">
                            Hero section statements only. Never in small UI components.
                        </Text>
                        <Text
                            variant="3xl"
                            className="mt-3 block"
                            style={{ fontFamily: '"Brush Script MT", cursive' }}
                        >
                            Find Your Adventure
                        </Text>
                        <Text variant="xs" className="mt-2 block opacity-60 text-[var(--color-sky-400)]">
                            Preview approximation. Use Tahu.ttf in production.
                        </Text>
                    </div>
                </div>
            </div>

            {/* Tahu Font Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-6">
                    <div className="flex-1">
                        <Text variant="lg" weight="semibold" className="mb-2 block">
                            TAHU Font Reference
                        </Text>
                        <Text variant="sm" intent="secondary" className="mb-4 block">
                            Handwritten brush script font for hero statements. Expressive,
                            warm, adventure-forward.
                        </Text>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <Text
                                variant="4xl"
                                className="text-[var(--color-navy-700)] block"
                                style={{ fontFamily: '"Brush Script MT", cursive' }}
                            >
                                A B C D E F G H I J K L M
                            </Text>
                            <Text
                                variant="4xl"
                                className="text-[var(--color-navy-700)] mt-2 block"
                                style={{ fontFamily: '"Brush Script MT", cursive' }}
                            >
                                N O P Q R S T U V W X Y Z
                            </Text>
                            <Text
                                variant="3xl"
                                className="text-[var(--color-navy-700)] mt-4 block"
                                style={{ fontFamily: '"Brush Script MT", cursive' }}
                            >
                                a b c d e f g h i j k l m n o p q r s t u v w x y z
                            </Text>
                            <Text
                                variant="3xl"
                                className="text-[var(--color-navy-700)] mt-2 block"
                                style={{ fontFamily: '"Brush Script MT", cursive' }}
                            >
                                0 1 2 3 4 5 6 7 8 9
                            </Text>
                        </div>
                        <Text variant="xs" intent="muted" className="mt-3 block">
                            Note: This preview uses a system brush font. The actual Tahu font
                            has more expressive, hand-drawn strokes.
                        </Text>
                    </div>
                    <div className="w-48 flex-shrink-0">
                        <div className="bg-[var(--color-navy-700)] rounded-lg p-4 text-center">
                            <Text variant="xs" weight="semibold" className="mb-2 block text-[var(--color-sky-400)] uppercase">
                                FONT FILE
                            </Text>
                            <Text weight="semibold" intent="inverse" className="block">Tahu.ttf</Text>
                            <Text variant="xs" className="mt-2 block text-[var(--color-sky-400)]">
                                181 glyphs
                            </Text>
                        </div>
                        <div className="mt-3 space-y-2">
                            <Text variant="xs" intent="muted" className="block">Uppercase letters</Text>
                            <Text variant="xs" intent="muted" className="block">Lowercase letters</Text>
                            <Text variant="xs" intent="muted" className="block">Numbers 0-9</Text>
                            <Text variant="xs" intent="muted" className="block">Special characters</Text>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {typography.map((type, index) => (
                    <div
                        key={type.name}
                        className={`p-6 ${index !== typography.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                    >
                        <div className="flex items-start justify-between gap-8">
                            <div className="flex-1">
                                <Text className={`mb-2 block ${type.className}`} intent="default">
                                    {type.sample}
                                </Text>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <Text weight="semibold" className="block">{type.name}</Text>
                                <Text variant="xs" intent="muted" className="font-mono mt-1 block">
                                    {type.size} / {type.weight} / {type.lineHeight}
                                </Text>
                                <Text variant="xs" className="mt-1 block text-[var(--color-ocean-500)]">
                                    {type.note}
                                </Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
