import React from "react";

export function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-6">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="size-6 bg-[#2c685c] rounded flex items-center justify-center text-white text-[10px]">
                        <span className="material-symbols-outlined text-xs">
                            deployed_code
                        </span>
                    </div>
                    <span className="font-bold">Next.js Feature</span>
                </div>
                <div className="flex gap-8 text-sm text-gray-500">
                    <a className="hover:text-[#2c685c]" href="#">
                        Twitter
                    </a>
                    <a className="hover:text-[#2c685c]" href="#">
                        Discord
                    </a>
                    <a className="hover:text-[#2c685c]" href="#">
                        Sponsors
                    </a>
                </div>
                <p className="text-sm text-gray-400">© 2024. Open Source under MIT.</p>
            </div>
        </footer>
    );
}
