import React from "react";

export function Architecture() {
    return (
        <section className="mb-24" id="architecture">
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#2c685c] text-3xl">
                    account_tree
                </span>
                <h2 className="text-3xl font-bold">Understanding the Architecture</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="size-12 bg-[#2c685c]/10 text-[#2c685c] rounded-xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined">grid_view</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Domain Isolation</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Instead of grouping by type (all components in one folder), we group
                        by <strong>feature</strong>. This minimizes global state complexity
                        and makes it easier for new developers to locate relevant logic
                        within seconds.
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="size-12 bg-[#2c685c]/10 text-[#2c685c] rounded-xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined">sync_alt</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Shared vs Feature</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Global UI elements live in{" "}
                        <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                            src/components
                        </code>
                        , while business-specific UI stays in{" "}
                        <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                            src/features/[name]/components
                        </code>
                        . Clean, predictable, and scalable.
                    </p>
                </div>
            </div>
        </section>
    );
}
