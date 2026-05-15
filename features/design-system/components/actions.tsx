export function Actions() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row w-full mt-8">
            <a
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-action-primary)] px-6 text-[var(--color-text-primary)] font-semibold transition-colors hover:bg-[var(--color-action-primary-hover)] md:w-auto"
                href="/docs"
            >
                View Documentation
            </a>
            <a
                className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-[var(--color-navy-700)] px-6 text-[var(--color-navy-700)] font-semibold transition-colors hover:bg-[var(--color-navy-700)] hover:text-white md:w-auto"
                href="#"
            >
                Explore Components
            </a>
        </div>
    );
}
