import React from "react";

export function Workflow() {
    return (
        <section
            className="py-12 bg-white dark:bg-gray-900 rounded-[2rem] px-8 md:px-16 border border-gray-100 dark:border-gray-800 shadow-xl"
            id="workflow"
        >
            <div className="max-w-4xl mx-auto">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl font-black tracking-tight">
                        AI-Enhanced Development Workflow
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Streamline your UI construction with high-fidelity AI generation and
                        feature-based integration.
                    </p>
                </div>
                <div className="space-y-12 relative">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="flex-none flex items-start justify-center">
                            <div className="size-10 bg-[#2c685c] text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xl font-bold">Generate UI/UX in AI</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Use modern LLMs to generate individual feature modules. Define your
                                requirements for a specific domain (e.g., "Generate a user
                                settings dashboard") and let the AI output clean Tailwind-ready
                                code.
                            </p>
                            <div className="bg-[#f9fafb] dark:bg-gray-800 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 mt-4">
                                <span className="text-xs font-mono text-[#2c685c] uppercase font-bold">
                                    Recommended Prompt
                                </span>
                                <p className="text-sm italic text-gray-500 mt-2">
                                    "Generate a responsive Next.js functional component for a
                                    profile billing section using Tailwind CSS. Use clean variables
                                    for spacing..."
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="flex-none flex items-start justify-center">
                            <div className="size-10 bg-[#2c685c]/20 text-[#2c685c] rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xl font-bold">Import and Map</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Take the generated code and place it directly into the relevant
                                feature directory. Map the AI's placeholders to your
                                feature-specific hooks and API endpoints.
                            </p>
                        </div>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="flex-none flex items-start justify-center">
                            <div className="size-10 bg-[#2c685c]/20 text-[#2c685c] rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xl font-bold">Iterative Refinement</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Use iterative prompting to refine details like form validation or
                                complex interactions. Keep your prompts atomic—one component or
                                one hook at a time to maintain high quality.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
