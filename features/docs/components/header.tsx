/* eslint-disable @next/next/no-img-element */
import React from "react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1a1c21]/80 backdrop-blur-md px-6 md:px-10 py-3">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-[#2c685c] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-xl">
                                deployed_code
                            </span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">
                            Next.js <span className="text-[#2c685c]">Feature</span>
                        </h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            className="text-sm font-medium hover:text-[#2c685c] transition-colors"
                            href="#architecture"
                        >
                            Architecture
                        </a>
                        <a
                            className="text-sm font-medium hover:text-[#2c685c] transition-colors"
                            href="#workflow"
                        >
                            Workflow
                        </a>
                        <a
                            className="text-sm font-medium hover:text-[#2c685c] transition-colors"
                            href="#"
                        >
                            Docs
                        </a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <label className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-64">
                        <span className="material-symbols-outlined text-gray-400 text-lg">
                            search
                        </span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-500"
                            placeholder="Search architecture..."
                        />
                    </label>
                    <button className="bg-[#2c685c] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        <span>Github</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
