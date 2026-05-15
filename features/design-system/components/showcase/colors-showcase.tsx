"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Text } from "@/shared/components/ui";
import type { ColorToken } from "@/shared/utils/design-tokens";

interface ColorsShowcaseProps {
    colors: Record<string, ColorToken[]>;
}

export function ColorsShowcase({ colors }: ColorsShowcaseProps) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Color Palette</Text>
                <Text variant="base" intent="secondary">
                    Adventure-forward, warm, and trustworthy color system for Juyonna Travels.
                </Text>
            </div>

            {Object.entries(colors).map(([category, colorList]) => (
                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <Text variant="lg" weight="semibold" intent='secondary' className="capitalize mb-4 block">{category} Colors</Text>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {colorList.map((color) => (
                            <div key={color.hex} className="group">
                                <div
                                    className="h-20 rounded-lg mb-3 cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => copyToClipboard(color.hex)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        {copiedColor === color.hex ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                </div>
                                <Text variant="sm" weight="medium" intent={'muted'} className="block text-gray-900">{color.name}</Text>
                                <Text variant="xs" intent="muted" className="font-mono block">{color.hex}</Text>
                                <Text variant="xs" intent="muted" className="mt-1 block">{color.usage}</Text>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
