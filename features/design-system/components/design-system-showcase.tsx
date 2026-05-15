"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import { Text } from "@/shared/components/ui";

import {
    ColorsShowcase,
    SemanticTokensShowcase,
    TypographyShowcase,
    SpacingShowcase,
    ButtonsShowcase,
    InputsShowcase,
    CardsShowcase,
    BadgesShowcase,
    AlertsShowcase,
    IconsShowcase,
    BrandVoiceShowcase,
    MotionShowcase,
    ImageryShowcase,
    NavigationShowcase,
    AdvancedFormsShowcase,
    DataTablesShowcase,
    OverlaysShowcase,
} from "./showcase";

import type { ColorToken, SemanticToken, TypographyToken, SpacingToken } from "@/shared/utils/design-tokens";

interface DesignSystemShowcaseProps {
    colors: Record<string, ColorToken[]>;
    typography: TypographyToken[];
    semanticTokens: Record<string, SemanticToken[]>;
    spacing: SpacingToken[];
}

const sections = [
    { id: "colors", label: "Colors" },
    { id: "tokens", label: "Semantic Tokens" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Inputs" },
    { id: "cards", label: "Cards" },
    { id: "badges", label: "Badges & Tags" },
    { id: "alerts", label: "Alerts" },
    { id: "icons", label: "Icons" },
    { id: "voice", label: "Brand Voice" },
    { id: "motion", label: "Motion" },
    { id: "imagery", label: "Imagery" },
    { id: "navigation", label: "Navigation" },
    { id: "forms", label: "Advanced Forms" },
    { id: "tables", label: "Data Tables" },
    { id: "overlays", label: "Overlays & Feedback" },
];

export function DesignSystemShowcase({
    colors,
    typography,
    semanticTokens,
    spacing,
}: DesignSystemShowcaseProps) {
    const [activeSection, setActiveSection] = useState("colors");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[var(--bg-page)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-[var(--color-text-primary)]" />
                        </div>
                        <div>
                            <Text variant="xl" weight="bold" className="tracking-tight block" intent="primary">Juyonna Travels</Text>
                            <Text variant="xs" intent="info" className="opacity-80">Design System v1.0</Text>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Text variant="sm" intent="info" className="opacity-80">Last updated: Week 1</Text>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-56 flex-shrink-0">
                    <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <Text as="p" variant="xs" weight="semibold" intent="muted" className="uppercase tracking-wider mb-3 block">Sections</Text>
                        <ul className="space-y-1">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${activeSection === section.id
                                            ? "bg-[var(--color-bg-primary)]"
                                            : "hover:bg-[var(--color-bg-muted)]"
                                            }`}
                                    >
                                        <Text variant="sm" weight="medium" intent={activeSection === section.id ? 'primary' : 'secondary'}>
                                            {section.label}
                                        </Text>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {activeSection === "colors" && <ColorsShowcase colors={colors} />}
                    {activeSection === "tokens" && <SemanticTokensShowcase semanticTokens={semanticTokens} />}
                    {activeSection === "typography" && <TypographyShowcase typography={typography} />}
                    {activeSection === "spacing" && <SpacingShowcase spacing={spacing} />}
                    {activeSection === "buttons" && <ButtonsShowcase />}
                    {activeSection === "inputs" && <InputsShowcase />}
                    {activeSection === "cards" && <CardsShowcase />}
                    {activeSection === "badges" && <BadgesShowcase />}
                    {activeSection === "alerts" && <AlertsShowcase />}
                    {activeSection === "icons" && <IconsShowcase />}
                    {activeSection === "voice" && <BrandVoiceShowcase />}
                    {activeSection === "motion" && <MotionShowcase />}
                    {activeSection === "imagery" && <ImageryShowcase />}
                    {activeSection === "navigation" && <NavigationShowcase />}
                    {activeSection === "forms" && <AdvancedFormsShowcase />}
                    {activeSection === "tables" && <DataTablesShowcase />}
                    {activeSection === "overlays" && <OverlaysShowcase />}
                </main>
            </div>
        </div>
    );
}
