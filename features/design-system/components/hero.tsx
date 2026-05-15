export function Hero() {
    return (
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-navy-100)] text-[var(--color-navy-700)] text-overline font-bold">
                <span>Design System v1.0</span>
            </div>
            <h1 className="text-hero-display text-[var(--color-text-primary)] max-w-2xl">
                Find Your Next Adventure
            </h1>
            <p className="text-body-large text-[var(--color-text-secondary)] max-w-xl">
                Discover breathtaking destinations and create unforgettable memories with
                Juyonna Travels. A scalable, domain-driven structure designed for your
                next big project.
            </p>
        </div>
    );
}
