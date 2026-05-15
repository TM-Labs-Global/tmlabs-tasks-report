/* eslint-disable @next/next/no-img-element */
export function Hero() {
    return (
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
            <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2c685c]/10 text-[#2c685c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs">
                        auto_awesome
                    </span>
                    Domain-Driven Architecture
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
                    Next.js <span className="text-[#2c685c]">Feature-Based</span> Template
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
                    A scalable, domain-driven structure designed for professional teams.
                    Build maintainable applications with co-located components, hooks,
                    and logic.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <button className="bg-[#2c685c] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Get Started
                    </button>
                    <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Live Demo
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
                <div className="bg-[#1a1c21] rounded-xl border border-gray-700 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
                    <div className="bg-[#2c303a] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                        <div className="flex gap-1.5">
                            <div className="size-3 rounded-full bg-red-500/80"></div>
                            <div className="size-3 rounded-full bg-yellow-500/80"></div>
                            <div className="size-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <span className="text-gray-400 text-xs ml-4">
                            Terminal — bash
                        </span>
                    </div>
                    <div className="p-6 text-gray-300">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                            <span className="material-symbols-outlined text-sm">
                                folder_open
                            </span>
                            <span>src/features</span>
                        </div>
                        <div className="ml-6 relative space-y-1">
                            <div className="flex items-center gap-2 text-[#2c685c]">
                                <span className="material-symbols-outlined text-sm">
                                    folder
                                </span>
                                <span>auth/</span>
                            </div>
                            <div className="ml-6 space-y-1 opacity-70">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">
                                        category
                                    </span>
                                    <span>components/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">
                                        anchor
                                    </span>
                                    <span>hooks/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs">
                                        api
                                    </span>
                                    <span>api/</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#2c685c] mt-2">
                                <span className="material-symbols-outlined text-sm">
                                    folder
                                </span>
                                <span>dashboard/</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#2c685c] mt-2">
                                <span className="material-symbols-outlined text-sm">
                                    folder
                                </span>
                                <span>profile/</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 mt-4 italic">
                                <span>// Each feature is self-contained</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}