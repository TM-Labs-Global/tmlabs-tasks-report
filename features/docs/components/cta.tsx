import React from "react";

export function CallToAction() {
    return (
        <div className="mt-32 text-center space-y-8 pb-20">
            <div className="size-20 bg-[#2c685c]/5 mx-auto rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2c685c] text-4xl">
                    rocket_launch
                </span>
            </div>
            <h2 className="text-3xl font-bold">
                Ready to build your next big thing?
            </h2>
            <div className="flex justify-center gap-4">
                <button className="bg-[#2c685c] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[#2c685c]/20 transition-all">
                    Initialize Repository
                </button>
            </div>
            <p className="text-sm text-gray-400 font-mono">
                npx create-next-app --template feature-based
            </p>
        </div>
    );
}
