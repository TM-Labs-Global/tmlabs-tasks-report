import { Plane, Hotel, Ship, FileText } from "lucide-react";
import { Text } from "@/shared/components/ui";

export function CardsShowcase() {
    return (
        <section className="space-y-8">
            <div>
                <Text variant="h2" weight="bold" className="mb-2 block">Cards</Text>
                <Text variant="base" intent="secondary">
                    Card components for displaying travel content and services.
                </Text>
            </div>

            {/* Service Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Text variant="lg" weight="semibold" className="mb-4 block">
                    Service Cards
                </Text>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        {
                            icon: Plane,
                            name: "Flights",
                            iconClass: "text-[var(--color-info)]",
                            bgClass: "bg-[var(--color-info-bg)]",
                        },
                        {
                            icon: Hotel,
                            name: "Hotels",
                            iconClass: "text-[var(--color-warning)]",
                            bgClass: "bg-[var(--color-warning-bg)]",
                        },
                        {
                            icon: Ship,
                            name: "Cargo",
                            iconClass: "text-[var(--color-action-secondary)]",
                            bgClass: "bg-[var(--color-navy-100)]",
                        },
                        {
                            icon: FileText,
                            name: "Visa",
                            iconClass: "text-[var(--color-success)]",
                            bgClass: "bg-[var(--color-success-bg)]",
                        },
                    ].map((service) => (
                        <div
                            key={service.name}
                            className="p-6 bg-[var(--color-bg-page)] rounded-xl hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[var(--color-border-default)] group"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${service.bgClass}`}
                            >
                                <service.icon className={`w-6 h-6 ${service.iconClass}`} />
                            </div>
                            <Text variant="base" weight="semibold" className="group-hover:text-[var(--color-action-secondary)] block">
                                {service.name}
                            </Text>
                            <Text variant="sm" intent="secondary" className="mt-1 block">
                                Book now →
                            </Text>
                        </div>
                    ))}
                </div>
            </div>

            {/* Destination Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Text variant="lg" weight="semibold" className="mb-4 block">
                    Destination Card
                </Text>
                <div className="grid grid-cols-3 gap-6">
                    <div className="rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                        <div className="relative h-48 bg-gradient-to-br from-[var(--color-sky-300)] to-[var(--color-ocean-500)]">
                            <img
                                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                                alt="Dubai"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3 bg-[var(--color-action-primary)] rounded px-2 py-1">
                                <Text variant="xs" weight="bold">TRENDING</Text>
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <Text variant="base" weight="semibold" className="block">
                                Dubai, UAE
                            </Text>
                            <Text variant="sm" intent="secondary" className="mt-1 block">
                                From ₦850,000
                            </Text>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">5 Days</Text>
                                </span>
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">All Inclusive</Text>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                        <div className="relative h-48">
                            <img
                                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop"
                                alt="Paris"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4 bg-white">
                            <Text variant="base" weight="semibold" className="block">
                                Paris, France
                            </Text>
                            <Text variant="sm" intent="secondary" className="mt-1 block">
                                From ₦1,200,000
                            </Text>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">7 Days</Text>
                                </span>
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">Romantic</Text>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                        <div className="relative h-48">
                            <img
                                src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&fit=crop"
                                alt="Maldives"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3 bg-[var(--color-orange-500)] rounded px-2 py-1">
                                <Text variant="xs" weight="bold" intent="inverse">20% OFF</Text>
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <Text variant="base" weight="semibold" className="block">
                                Maldives
                            </Text>
                            <Text variant="sm" intent="secondary" className="mt-1 block">
                                From ₦2,500,000
                            </Text>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">10 Days</Text>
                                </span>
                                <span className="bg-[var(--color-navy-100)] px-2 py-1 rounded">
                                    <Text variant="xs">Luxury</Text>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Text variant="lg" weight="semibold" className="mb-4 block">
                    Info & Stat Cards
                </Text>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 bg-gradient-to-br from-[var(--color-navy-700)] to-[var(--color-navy-600)] rounded-xl text-white">
                        <Text variant="sm" className="mb-1 block opacity-80" intent="inverse">
                            Total Bookings
                        </Text>
                        <Text variant="3xl" weight="bold" className="block" intent="inverse">2,847</Text>
                        <Text variant="xs" className="mt-2 block opacity-80" intent="inverse">
                            ↑ 12% from last month
                        </Text>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-[var(--color-yellow-500)] to-[var(--color-orange-500)] rounded-xl">
                        <Text variant="sm" intent="primary" className="mb-1 block opacity-70">
                            Revenue
                        </Text>
                        <Text variant="3xl" weight="bold" className="block" intent="primary">
                            ₦45.2M
                        </Text>
                        <Text variant="xs" intent="primary" className="mt-2 block opacity-70">
                            ↑ 8% from last month
                        </Text>
                    </div>
                    <div className="p-5 bg-white border-2 border-[var(--color-sky-300)] rounded-xl">
                        <Text variant="sm" intent="secondary" className="mb-1 block">
                            Active Trips
                        </Text>
                        <Text variant="3xl" weight="bold" className="block">
                            156
                        </Text>
                        <Text variant="xs" className="mt-2 block" intent="info">
                            Currently traveling
                        </Text>
                    </div>
                </div>
            </div>
        </section>
    );
}
