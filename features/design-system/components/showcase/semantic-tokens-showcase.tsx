import { Text } from "@/shared/components/ui";
import { SemanticToken } from "@/shared/utils/design-tokens";
import { AlertCircle, Check, Copy, Eye, Info } from "lucide-react";
import { useState } from "react";

interface SemanticTokensShowcaseProps {
    semanticTokens: Record<string, SemanticToken[]>;
}

export function SemanticTokensShowcase({ semanticTokens }: SemanticTokensShowcaseProps) {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Semantic Color Tokens</Text>
                <Text variant="base" intent="secondary">
                    Purpose-driven color system for scalable, consistent UI development.
                    Map these tokens to components, not raw hex values.
                </Text>
            </div>

            {/* Token System Overview */}
            <div className="bg-gradient-to-br from-[var(--color-navy-700)] to-[var(--color-navy-600)] rounded-xl p-6 text-white">
                <Text variant="lg" weight="semibold" className="mb-4 text-[var(--color-action-primary)] block">
                    Why Semantic Tokens?
                </Text>
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-lg p-4">
                        <Text weight="semibold" intent="inverse" className="block">Consistency</Text>
                        <Text variant="sm" intent="inverse" className="opacity-80 mt-1 block">
                            Single source of truth across all components
                        </Text>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <Text weight="semibold" intent="inverse" className="block">Maintainability</Text>
                        <Text variant="sm" intent="inverse" className="opacity-80 mt-1 block">
                            Change once, update everywhere
                        </Text>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <Text weight="semibold" intent="inverse" className="block">Dark Mode Ready</Text>
                        <Text variant="sm" intent="inverse" className="opacity-80 mt-1 block">
                            Swap token values for theme switching
                        </Text>
                    </div>
                </div>
            </div>

            {Object.entries(semanticTokens).map(([category, tokens]) => (
                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <Text variant="lg" weight="semibold" className="capitalize mb-4 block">
                        {category === "text"
                            ? "Text Colors"
                            : category === "background"
                                ? "Background Colors"
                                : category === "border"
                                    ? "Border Colors"
                                    : category === "action"
                                        ? "Action Colors"
                                        : "Feedback Colors"}
                    </Text>
                    <div className="space-y-3">
                        {tokens.map((item) => (
                            <div
                                key={item.token}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div
                                    className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer relative"
                                    style={{ backgroundColor: item.hex }}
                                    onClick={() => copyToClipboard(item.hex)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                                        {copiedColor === item.hex ? (
                                            <Check className="w-4 h-4 text-white" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Text variant="sm" weight="semibold" className="font-mono block">
                                        {item.token}
                                    </Text>
                                    <Text variant="xs" intent="muted" className="truncate block">{item.usage}</Text>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <Text variant="xs" intent="muted" className="font-mono block">{item.hex}</Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Token Usage Examples */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Text variant="lg" weight="semibold" className="mb-4 block">Usage Examples</Text>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Text variant="sm" weight="semibold" intent="secondary" className="block">Alert Component</Text>
                        <div className="space-y-2">
                            <div className="p-3 rounded-lg flex items-center gap-3 bg-[var(--color-success-bg)] border-l-4 border-[var(--color-success)]">
                                <Check className="w-5 h-5 text-[var(--color-success)]" />
                                <Text variant="sm" className="text-[var(--color-success-800)]">
                                    Success: color-success-bg + color-success + Success 800
                                </Text>
                            </div>
                            <div className="p-3 rounded-lg flex items-center gap-3 bg-[var(--color-error-bg)] border-l-4 border-[var(--color-error)]">
                                <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
                                <Text variant="sm" className="text-[var(--color-error-800)]">
                                    Error: color-error-bg + color-error + Error 800
                                </Text>
                            </div>
                            <div className="p-3 rounded-lg flex items-center gap-3 bg-[var(--color-warning-bg)] border-l-4 border-[var(--color-warning)]">
                                <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />
                                <Text variant="sm" className="text-[var(--color-warning-800)]">
                                    Warning: color-warning-bg + color-warning + Warning 800
                                </Text>
                            </div>
                            <div className="p-3 rounded-lg flex items-center gap-3 bg-[var(--color-info-bg)] border-l-4 border-[var(--color-info)]">
                                <Info className="w-5 h-5 text-[var(--color-info)]" />
                                <Text variant="sm" className="text-[var(--color-info-800)]">
                                    Info: color-info-bg + color-info + Info 800
                                </Text>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Text variant="sm" weight="semibold" intent="secondary" className="block">Button States</Text>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-action-primary)] text-[var(--color-text-primary)]">
                                    Primary
                                </button>
                                <Text variant="xs" intent="muted">color-action-primary</Text>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-action-primary-hover)] text-[var(--color-text-primary)]">
                                    Hover
                                </button>
                                <Text variant="xs" intent="muted">color-action-primary-hover</Text>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-action-disabled)] text-[var(--color-text-disabled)]">
                                    Disabled
                                </button>
                                <Text variant="xs" intent="muted">color-action-disabled</Text>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-action-destructive)]">
                                    Delete
                                </button>
                                <Text variant="xs" intent="muted">color-action-destructive</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accessibility Notes */}
            <div className="bg-[var(--color-ocean-100)] border border-[var(--color-ocean-300)] rounded-xl p-6">
                <Text variant="lg" weight="semibold" className="text-[var(--color-navy-700)] mb-3 flex items-center gap-2 block">
                    <Eye className="w-5 h-5" /> Accessibility Compliance
                </Text>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <Text variant="sm" weight="medium" className="text-[var(--color-navy-700)] mb-2 block">
                            ✓ WCAG AA Compliant Pairs
                        </Text>
                        <ul className="space-y-1">
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• color-text-primary on color-bg-card (12.6:1)</Text></li>
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• color-text-inverse on color-bg-inverse (16.1:1)</Text></li>
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• Success 800 on color-success-bg (7.2:1)</Text></li>
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• Error 800 on color-error-bg (6.8:1)</Text></li>
                        </ul>
                    </div>
                    <div>
                        <Text variant="sm" weight="medium" className="text-[var(--color-navy-700)] mb-2 block">⚠️ Use With Care</Text>
                        <ul className="text-[var(--color-ocean-800)] space-y-1">
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• Yellow text on white (use navy text instead)</Text></li>
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• Light colors (100-300) for text</Text></li>
                            <li><Text variant="xs" className="text-[var(--color-ocean-800)]">• Orange on light backgrounds for small text</Text></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
