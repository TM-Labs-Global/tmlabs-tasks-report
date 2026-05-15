import React from "react";
import {
    Header,
    Hero,
    Architecture,
    Workflow,
    CallToAction,
    Footer,
} from "../components";

export function DocsPage() {
    return (
        <div className="bg-[#f9fafb] dark:bg-[#1a1c21] text-[#131615] dark:text-gray-100 min-h-screen font-sans">
            <div className="layout-container flex flex-col">
                <Header />
                <main className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
                    <Hero />
                    <Architecture />
                    <Workflow />
                    <CallToAction />
                </main>
                <Footer />
            </div>
        </div>
    );
}
