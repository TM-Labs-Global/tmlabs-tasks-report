import { Text } from "@/shared/components/ui";
import type { SpacingToken } from "@/shared/utils/design-tokens";

interface SpacingShowcaseProps {
    spacing: SpacingToken[];
}

export function SpacingShowcase({ spacing }: SpacingShowcaseProps) {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Spacing Scale</Text>
                <Text variant="base" intent="secondary">
                    Consistent spacing tokens for layouts and components.
                </Text>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {spacing.map((space) => (
                        <div key={space.name} className="flex items-center gap-6">
                            <div className="w-20 text-right">
                                <Text variant="sm" weight="semibold" className="font-mono" intent="secondary">
                                    {space.name}
                                </Text>
                            </div>
                            <div
                                className="bg-[var(--color-ocean-500)] rounded"
                                style={{ width: space.value, height: "24px" }}
                            />
                            <div className="flex-1 flex items-center gap-3">
                                <Text variant="sm" weight="medium">
                                    {space.value}
                                </Text>
                                <Text variant="sm" intent="muted">{space.usage}</Text>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
