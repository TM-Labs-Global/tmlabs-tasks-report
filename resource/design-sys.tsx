import { useState } from 'react';
import { Plane, Hotel, Ship, FileText, GraduationCap, Shield, Calendar, ShoppingBag, MapPin, ChevronRight, Check, AlertCircle, Info, X, Bell, User, Search, Menu, Copy, Eye, Grid3X3, HelpCircle, ChevronDown, Home, Briefcase, MessageSquare, Package, Palmtree, Car, Globe, Ticket, Cake, Upload, MoreHorizontal, ChevronLeft, Compass, Wifi, WifiOff, Filter, Sliders } from 'lucide-react';

function App() {
    const [activeSection, setActiveSection] = useState('colors');
    const [copiedColor, setCopiedColor] = useState<any>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const colors = {
        navy: [
            { name: 'Navy 100', hex: '#e6f0f5', usage: 'Lightest backgrounds, subtle tints' },
            { name: 'Navy 200', hex: '#b3d1e0', usage: 'Light backgrounds, disabled states' },
            { name: 'Navy 300', hex: '#80b3cc', usage: 'Borders, dividers' },
            { name: 'Navy 400', hex: '#4d94b7', usage: 'Placeholder text, icons' },
            { name: 'Navy 500', hex: '#1a75a3', usage: 'Secondary text, hover states' },
            { name: 'Navy 600', hex: '#0a5a82', usage: 'Hover states, secondary surfaces' },
            { name: 'Navy 700', hex: '#023047', usage: 'Primary - Headers, nav, text emphasis' },
            { name: 'Navy 800', hex: '#012033', usage: 'Deep backgrounds, overlays' },
            { name: 'Navy 900', hex: '#011220', usage: 'Darkest - High contrast elements' },
        ],
        skyBlue: [
            { name: 'Sky 100', hex: '#e8f5fa', usage: 'Lightest backgrounds, subtle fills' },
            { name: 'Sky 200', hex: '#c4e8f3', usage: 'Light card backgrounds' },
            { name: 'Sky 300', hex: '#a0dbed', usage: 'Hover states, secondary fills' },
            { name: 'Sky 400', hex: '#8ecae6', usage: 'Primary - Backgrounds, soft gradients' },
            { name: 'Sky 500', hex: '#5dbdd9', usage: 'Interactive elements, badges' },
            { name: 'Sky 600', hex: '#3aa8c7', usage: 'Hover states' },
            { name: 'Sky 700', hex: '#2993b0', usage: 'Active states' },
            { name: 'Sky 800', hex: '#1a6d83', usage: 'Dark accents' },
            { name: 'Sky 900', hex: '#0d4756', usage: 'Darkest - Text on light sky backgrounds' },
        ],
        oceanBlue: [
            { name: 'Ocean 100', hex: '#e4f4f7', usage: 'Lightest backgrounds' },
            { name: 'Ocean 200', hex: '#b8e1ea', usage: 'Light fills, disabled buttons' },
            { name: 'Ocean 300', hex: '#8ccedd', usage: 'Borders, secondary elements' },
            { name: 'Ocean 400', hex: '#60bbcf', usage: 'Hover states' },
            { name: 'Ocean 500', hex: '#219ebc', usage: 'Primary - Buttons, links, selection' },
            { name: 'Ocean 600', hex: '#1a7a94', usage: 'Hover states, active elements' },
            { name: 'Ocean 700', hex: '#145d71', usage: 'Pressed states' },
            { name: 'Ocean 800', hex: '#0e414f', usage: 'Dark accents' },
            { name: 'Ocean 900', hex: '#08242d', usage: 'Darkest - Text on light ocean backgrounds' },
        ],
        yellow: [
            { name: 'Yellow 100', hex: '#fff8e6', usage: 'Lightest - Alert backgrounds' },
            { name: 'Yellow 200', hex: '#ffefc2', usage: 'Light highlights, subtle emphasis' },
            { name: 'Yellow 300', hex: '#ffe699', usage: 'Soft highlights' },
            { name: 'Yellow 400', hex: '#ffdc70', usage: 'Hover states, badges' },
            { name: 'Yellow 500', hex: '#ffb703', usage: 'Primary - CTAs, important actions' },
            { name: 'Yellow 600', hex: '#e6a503', usage: 'Hover states on yellow' },
            { name: 'Yellow 700', hex: '#cc9203', usage: 'Pressed states' },
        ],
        orange: [
            { name: 'Orange 100', hex: '#fff0e0', usage: 'Lightest - Notification backgrounds' },
            { name: 'Orange 200', hex: '#ffdbb8', usage: 'Light fills' },
            { name: 'Orange 300', hex: '#ffc68f', usage: 'Soft accents' },
            { name: 'Orange 400', hex: '#ffb167', usage: 'Hover states' },
            { name: 'Orange 500', hex: '#fb8500', usage: 'Primary - Notifications, energy, promos' },
            { name: 'Orange 600', hex: '#e27800', usage: 'Hover states' },
            { name: 'Orange 700', hex: '#c96a00', usage: 'Pressed states' },
        ],
        success: [
            { name: 'Success 100', hex: '#ecfdf5', usage: 'Lightest success backgrounds' },
            { name: 'Success 200', hex: '#d1fae5', usage: 'Success alert backgrounds' },
            { name: 'Success 300', hex: '#a7f3d0', usage: 'Success borders, highlights' },
            { name: 'Success 400', hex: '#6ee7b7', usage: 'Success badges, icons' },
            { name: 'Success 500', hex: '#10b981', usage: 'Primary - Confirmations, valid states' },
            { name: 'Success 600', hex: '#059669', usage: 'Hover states' },
            { name: 'Success 700', hex: '#047857', usage: 'Pressed states, emphasis' },
            { name: 'Success 800', hex: '#065f46', usage: 'Text on light success backgrounds' },
            { name: 'Success 900', hex: '#064e3b', usage: 'Darkest - High contrast text' },
        ],
        error: [
            { name: 'Error 100', hex: '#fef2f2', usage: 'Lightest error backgrounds' },
            { name: 'Error 200', hex: '#fecaca', usage: 'Error alert backgrounds' },
            { name: 'Error 300', hex: '#fca5a5', usage: 'Error borders, highlights' },
            { name: 'Error 400', hex: '#f87171', usage: 'Error badges, icons' },
            { name: 'Error 500', hex: '#ef4444', usage: 'Primary - Errors, destructive actions' },
            { name: 'Error 600', hex: '#dc2626', usage: 'Hover states on destructive' },
            { name: 'Error 700', hex: '#b91c1c', usage: 'Pressed states, emphasis' },
            { name: 'Error 800', hex: '#991b1b', usage: 'Text on light error backgrounds' },
            { name: 'Error 900', hex: '#7f1d1d', usage: 'Darkest - High contrast text' },
        ],
        warning: [
            { name: 'Warning 100', hex: '#fffbeb', usage: 'Lightest warning backgrounds' },
            { name: 'Warning 200', hex: '#fef3c7', usage: 'Warning alert backgrounds' },
            { name: 'Warning 300', hex: '#fde68a', usage: 'Warning borders, highlights' },
            { name: 'Warning 400', hex: '#fcd34d', usage: 'Warning badges, icons' },
            { name: 'Warning 500', hex: '#f59e0b', usage: 'Primary - Alerts, expiring items' },
            { name: 'Warning 600', hex: '#d97706', usage: 'Hover states' },
            { name: 'Warning 700', hex: '#b45309', usage: 'Pressed states, emphasis' },
            { name: 'Warning 800', hex: '#92400e', usage: 'Text on light warning backgrounds' },
            { name: 'Warning 900', hex: '#78350f', usage: 'Darkest - High contrast text' },
        ],
        info: [
            { name: 'Info 100', hex: '#e0f7ff', usage: 'Lightest info backgrounds' },
            { name: 'Info 200', hex: '#b8ecf8', usage: 'Info alert backgrounds' },
            { name: 'Info 300', hex: '#8cddf0', usage: 'Info borders, highlights' },
            { name: 'Info 400', hex: '#5cc8e5', usage: 'Info badges, icons' },
            { name: 'Info 500', hex: '#219ebc', usage: 'Primary - System messages, hints' },
            { name: 'Info 600', hex: '#1a7a94', usage: 'Hover states' },
            { name: 'Info 700', hex: '#145d71', usage: 'Pressed states' },
            { name: 'Info 800', hex: '#0e414f', usage: 'Text on light info backgrounds' },
            { name: 'Info 900', hex: '#08242d', usage: 'Darkest - High contrast text' },
        ],
        neutral: [
            { name: 'White', hex: '#ffffff', usage: 'Backgrounds, cards' },
            { name: 'Gray 50', hex: '#f9fafb', usage: 'Page backgrounds' },
            { name: 'Gray 100', hex: '#f3f4f6', usage: 'Dividers, borders' },
            { name: 'Gray 200', hex: '#e5e7eb', usage: 'Light borders' },
            { name: 'Gray 300', hex: '#d1d5db', usage: 'Disabled states' },
            { name: 'Gray 400', hex: '#9ca3af', usage: 'Placeholder text' },
            { name: 'Gray 500', hex: '#6b7280', usage: 'Secondary text' },
            { name: 'Gray 600', hex: '#4b5563', usage: 'Muted text' },
            { name: 'Gray 700', hex: '#374151', usage: 'Body text' },
            { name: 'Gray 800', hex: '#1f2937', usage: 'Dark text' },
            { name: 'Gray 900', hex: '#111827', usage: 'Headings' },
        ],
    };

    const typography = [
        { name: 'Hero Display', size: '56px', weight: '400', lineHeight: '1.1', sample: 'Find Your Next Adventure', font: 'tahu', note: 'TAHU - Hero sections only' },
        { name: 'Display', size: '48px', weight: '700', lineHeight: '1.1', sample: 'Explore the World', font: 'poppins', note: 'Poppins Bold' },
        { name: 'H1', size: '36px', weight: '700', lineHeight: '1.2', sample: 'Book Your Adventure', font: 'poppins', note: 'Poppins Bold' },
        { name: 'H2', size: '28px', weight: '600', lineHeight: '1.3', sample: 'Featured Destinations', font: 'poppins', note: 'Poppins SemiBold' },
        { name: 'H3', size: '22px', weight: '600', lineHeight: '1.4', sample: 'Flight Details', font: 'poppins', note: 'Poppins SemiBold' },
        { name: 'H4', size: '18px', weight: '600', lineHeight: '1.4', sample: 'Traveler Information', font: 'poppins', note: 'Poppins SemiBold' },
        { name: 'Body Large', size: '16px', weight: '400', lineHeight: '1.6', sample: 'Discover breathtaking destinations and create unforgettable memories with Juyonna Travels.', font: 'poppins', note: 'Poppins Regular' },
        { name: 'Body', size: '14px', weight: '400', lineHeight: '1.5', sample: 'Your journey begins here. We handle everything from flights to accommodations.', font: 'poppins', note: 'Poppins Regular' },
        { name: 'Caption', size: '12px', weight: '500', lineHeight: '1.4', sample: 'Last updated 2 hours ago', font: 'poppins', note: 'Poppins Medium' },
        { name: 'Overline', size: '11px', weight: '600', lineHeight: '1.3', sample: 'TRENDING NOW', transform: 'uppercase', font: 'poppins', note: 'Poppins SemiBold' },
    ];

    const spacing = [
        { name: 'xs', value: '4px', usage: 'Tight spacing, icon gaps' },
        { name: 'sm', value: '8px', usage: 'Related elements' },
        { name: 'md', value: '16px', usage: 'Component padding' },
        { name: 'lg', value: '24px', usage: 'Section gaps' },
        { name: 'xl', value: '32px', usage: 'Major sections' },
        { name: '2xl', value: '48px', usage: 'Page sections' },
        { name: '3xl', value: '64px', usage: 'Hero spacing' },
    ];

    const sections = [
        { id: 'colors', label: 'Colors' },
        { id: 'tokens', label: 'Semantic Tokens' },
        { id: 'typography', label: 'Typography' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'buttons', label: 'Buttons' },
        { id: 'inputs', label: 'Inputs' },
        { id: 'cards', label: 'Cards' },
        { id: 'badges', label: 'Badges & Tags' },
        { id: 'alerts', label: 'Alerts' },
        { id: 'icons', label: 'Icons' },
        { id: 'voice', label: 'Brand Voice' },
        { id: 'motion', label: 'Motion' },
        { id: 'imagery', label: 'Imagery' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'forms', label: 'Advanced Forms' },
        { id: 'tables', label: 'Data Tables' },
        { id: 'overlays', label: 'Overlays & Feedback' },
    ];

    const semanticTokens = {
        text: [
            { token: 'color-text-primary', value: '#023047', hex: '#023047', usage: 'Headings, emphasis, primary content' },
            { token: 'color-text-secondary', value: '#374151', hex: '#374151', usage: 'Body text, descriptions' },
            { token: 'color-text-tertiary', value: '#6b7280', hex: '#6b7280', usage: 'Captions, helper text, timestamps' },
            { token: 'color-text-disabled', value: '#9ca3af', hex: '#9ca3af', usage: 'Disabled labels, placeholders' },
            { token: 'color-text-inverse', value: '#ffffff', hex: '#ffffff', usage: 'Text on dark backgrounds' },
            { token: 'color-text-link', value: '#219ebc', hex: '#219ebc', usage: 'Hyperlinks, clickable text' },
        ],
        background: [
            { token: 'color-bg-page', value: '#f9fafb', hex: '#f9fafb', usage: 'Main page background' },
            { token: 'color-bg-card', value: '#ffffff', hex: '#ffffff', usage: 'Card surfaces, panels' },
            { token: 'color-bg-elevated', value: '#ffffff', hex: '#ffffff', usage: 'Modals, dropdowns, popovers' },
            { token: 'color-bg-muted', value: '#f3f4f6', hex: '#f3f4f6', usage: 'Subtle backgrounds, zebra stripes' },
            { token: 'color-bg-inverse', value: '#023047', hex: '#023047', usage: 'Dark sections, footer' },
            { token: 'color-bg-brand', value: '#ffb703', hex: '#ffb703', usage: 'Brand highlight sections' },
        ],
        border: [
            { token: 'color-border-default', value: '#e5e7eb', hex: '#e5e7eb', usage: 'Standard borders, dividers' },
            { token: 'color-border-subtle', value: '#f3f4f6', hex: '#f3f4f6', usage: 'Subtle separators' },
            { token: 'color-border-focus', value: '#219ebc', hex: '#219ebc', usage: 'Focus rings, active states' },
            { token: 'color-border-error', value: '#ef4444', hex: '#ef4444', usage: 'Error input borders' },
            { token: 'color-border-success', value: '#10b981', hex: '#10b981', usage: 'Success input borders' },
        ],
        action: [
            { token: 'color-action-primary', value: '#ffb703', hex: '#ffb703', usage: 'Primary CTA buttons' },
            { token: 'color-action-primary-hover', value: '#ffc933', hex: '#ffc933', usage: 'Primary CTA hover' },
            { token: 'color-action-secondary', value: '#023047', hex: '#023047', usage: 'Secondary buttons' },
            { token: 'color-action-secondary-hover', value: '#0a5a82', hex: '#0a5a82', usage: 'Secondary hover' },
            { token: 'color-action-tertiary', value: '#219ebc', hex: '#219ebc', usage: 'Tertiary/links' },
            { token: 'color-action-disabled', value: '#d1d5db', hex: '#d1d5db', usage: 'Disabled buttons' },
            { token: 'color-action-destructive', value: '#ef4444', hex: '#ef4444', usage: 'Delete, cancel actions' },
            { token: 'color-action-destructive-hover', value: '#dc2626', hex: '#dc2626', usage: 'Destructive hover' },
        ],
        feedback: [
            { token: 'color-success', value: '#10b981', hex: '#10b981', usage: 'Success icons, text' },
            { token: 'color-success-bg', value: '#ecfdf5', hex: '#ecfdf5', usage: 'Success alert background' },
            { token: 'color-error', value: '#ef4444', hex: '#ef4444', usage: 'Error icons, text' },
            { token: 'color-error-bg', value: '#fef2f2', hex: '#fef2f2', usage: 'Error alert background' },
            { token: 'color-warning', value: '#f59e0b', hex: '#f59e0b', usage: 'Warning icons, text' },
            { token: 'color-warning-bg', value: '#fffbeb', hex: '#fffbeb', usage: 'Warning alert background' },
            { token: 'color-info', value: '#219ebc', hex: '#219ebc', usage: 'Info icons, text' },
            { token: 'color-info-bg', value: '#e0f7ff', hex: '#e0f7ff', usage: 'Info alert background' },
        ],
    };

    const [showServicesMenu, setShowServicesMenu] = useState(false);
    const [activeSearchTab, setActiveSearchTab] = useState('flights');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedTripType, setSelectedTripType] = useState('roundtrip');
    const [toggleStates, setToggleStates] = useState<any>({ notifications: true, marketing: false, sms: true });
    const [showModal, setShowModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [toastVisible, setToastVisible] = useState({ success: false, error: false });

    const services = [
        { icon: Plane, name: 'Flights', category: 'Travel' },
        { icon: Hotel, name: 'Hotels', category: 'Travel' },
        { icon: Palmtree, name: 'Holidays', category: 'Travel' },
        { icon: Calendar, name: 'Tours', category: 'Travel' },
        { icon: Ship, name: 'Cargo', category: 'Logistics' },
        { icon: Car, name: 'Protocol', category: 'Logistics' },
        { icon: FileText, name: 'Visa', category: 'Lifestyle' },
        { icon: GraduationCap, name: 'Study Abroad', category: 'Lifestyle' },
        { icon: Shield, name: 'Insurance', category: 'Lifestyle' },
        { icon: Plane, name: 'Charter', category: 'Lifestyle' },
        { icon: ShoppingBag, name: 'Shop', category: 'Lifestyle' },
        { icon: Ticket, name: 'Events', category: 'Lifestyle' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#023047] text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffb703] rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-[#023047]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Juyonna Travels</h1>
                            <p className="text-xs text-[#8ecae6]">Design System v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[#8ecae6]">Last updated: Week 1</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-56 flex-shrink-0">
                    <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Components</p>
                        <ul className="space-y-1">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                                                ? 'bg-[#023047] text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {section.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Colors Section */}
                    {activeSection === 'colors' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Color Palette</h2>
                                <p className="text-gray-600">Adventure-forward, warm, and trustworthy color system for Juyonna Travels.</p>
                            </div>

                            {Object.entries(colors).map(([category, colorList]) => (
                                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 capitalize mb-4">{category} Colors</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {colorList.map((color) => (
                                            <div key={color.hex} className="group">
                                                <div
                                                    className="h-20 rounded-lg mb-3 cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
                                                    style={{ backgroundColor: color.hex }}
                                                    onClick={() => copyToClipboard(color.hex)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                        {copiedColor === color.hex ? (
                                                            <Check className="w-5 h-5 text-white" />
                                                        ) : (
                                                            <Copy className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm">{color.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{color.hex}</p>
                                                <p className="text-xs text-gray-400 mt-1">{color.usage}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Semantic Tokens Section */}
                    {activeSection === 'tokens' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Semantic Color Tokens</h2>
                                <p className="text-gray-600">Purpose-driven color system for scalable, consistent UI development. Map these tokens to components, not raw hex values.</p>
                            </div>

                            {/* Token System Overview */}
                            <div className="bg-gradient-to-br from-[#023047] to-[#0a5a82] rounded-xl p-6 text-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#ffb703]">Why Semantic Tokens?</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Consistency</p>
                                        <p className="text-sm text-white/80 mt-1">Single source of truth across all components</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Maintainability</p>
                                        <p className="text-sm text-white/80 mt-1">Change once, update everywhere</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Dark Mode Ready</p>
                                        <p className="text-sm text-white/80 mt-1">Swap token values for theme switching</p>
                                    </div>
                                </div>
                            </div>

                            {Object.entries(semanticTokens).map(([category, tokens]) => (
                                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 capitalize mb-4">
                                        {category === 'text' ? 'Text Colors' :
                                            category === 'background' ? 'Background Colors' :
                                                category === 'border' ? 'Border Colors' :
                                                    category === 'action' ? 'Action Colors' : 'Feedback Colors'}
                                    </h3>
                                    <div className="space-y-3">
                                        {tokens.map((item) => (
                                            <div key={item.token} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                                <div
                                                    className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer relative"
                                                    style={{ backgroundColor: item.hex }}
                                                    onClick={() => copyToClipboard(item.hex)}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                                                        {copiedColor === item.hex ? (
                                                            <Check className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono text-sm font-semibold text-[#023047]">{item.token}</p>
                                                    <p className="text-xs text-gray-500 truncate">{item.usage}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-mono text-xs text-gray-400">{item.hex}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Token Usage Examples */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-gray-700">Alert Component</p>
                                        <div className="space-y-2">
                                            <div className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981' }}>
                                                <Check className="w-5 h-5" style={{ color: '#10b981' }} />
                                                <span className="text-sm" style={{ color: '#065f46' }}>Success: color-success-bg + color-success + Success 800</span>
                                            </div>
                                            <div className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                                                <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                                                <span className="text-sm" style={{ color: '#991b1b' }}>Error: color-error-bg + color-error + Error 800</span>
                                            </div>
                                            <div className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
                                                <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                                                <span className="text-sm" style={{ color: '#92400e' }}>Warning: color-warning-bg + color-warning + Warning 800</span>
                                            </div>
                                            <div className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#e0f7ff', borderLeft: '4px solid #219ebc' }}>
                                                <Info className="w-5 h-5" style={{ color: '#219ebc' }} />
                                                <span className="text-sm" style={{ color: '#0e414f' }}>Info: color-info-bg + color-info + Info 800</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-gray-700">Button States</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#ffb703', color: '#023047' }}>Primary</button>
                                                <span className="text-xs text-gray-500">color-action-primary</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#ffc933', color: '#023047' }}>Hover</button>
                                                <span className="text-xs text-gray-500">color-action-primary-hover</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#d1d5db', color: '#9ca3af' }}>Disabled</button>
                                                <span className="text-xs text-gray-500">color-action-disabled</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#ef4444' }}>Delete</button>
                                                <span className="text-xs text-gray-500">color-action-destructive</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accessibility Notes */}
                            <div className="bg-[#e0f7ff] border border-[#8ccedd] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#023047] mb-3 flex items-center gap-2">
                                    <Eye className="w-5 h-5" /> Accessibility Compliance
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium text-[#023047] mb-2">✓ WCAG AA Compliant Pairs</p>
                                        <ul className="text-[#0e414f] space-y-1">
                                            <li>• color-text-primary on color-bg-card (12.6:1)</li>
                                            <li>• color-text-inverse on color-bg-inverse (16.1:1)</li>
                                            <li>• Success 800 on color-success-bg (7.2:1)</li>
                                            <li>• Error 800 on color-error-bg (6.8:1)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#023047] mb-2">⚠️ Use With Care</p>
                                        <ul className="text-[#0e414f] space-y-1">
                                            <li>• Yellow text on white (use navy text instead)</li>
                                            <li>• Light colors (100-300) for text</li>
                                            <li>• Orange on light backgrounds for small text</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Typography Section */}
                    {activeSection === 'typography' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Typography</h2>
                                <p className="text-gray-600">Poppins for all UI content. TAHU decorative font for hero statements only.</p>
                            </div>

                            {/* Font Family Info */}
                            <div className="bg-gradient-to-r from-[#023047] to-[#0a4d6b] rounded-xl p-6 text-white">
                                <h3 className="text-lg font-semibold mb-4">Font Families</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[#ffb703] text-sm font-semibold mb-2">PRIMARY: POPPINS</p>
                                        <p className="text-[#8ecae6] text-sm">Body, UI labels, form fields, card titles, buttons, navigation</p>
                                        <p className="text-2xl font-semibold mt-3">Aa Bb Cc 123</p>
                                    </div>
                                    <div>
                                        <p className="text-[#ffb703] text-sm font-semibold mb-2">DECORATIVE: TAHU</p>
                                        <p className="text-[#8ecae6] text-sm">Hero section statements only. Never in small UI components.</p>
                                        <p className="text-3xl mt-3" style={{ fontFamily: 'Brush Script MT, cursive' }}>Find Your Adventure</p>
                                        <p className="text-xs text-[#8ecae6]/60 mt-2">Preview approximation. Use Tahu.ttf in production.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tahu Font Reference */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">TAHU Font Reference</h3>
                                        <p className="text-sm text-gray-600 mb-4">Handwritten brush script font for hero statements. Expressive, warm, adventure-forward.</p>
                                        <div className="bg-gray-50 rounded-lg p-6">
                                            <p className="text-4xl text-[#023047]" style={{ fontFamily: 'Brush Script MT, cursive' }}>A B C D E F G H I J K L M</p>
                                            <p className="text-4xl text-[#023047] mt-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>N O P Q R S T U V W X Y Z</p>
                                            <p className="text-3xl text-[#023047] mt-4" style={{ fontFamily: 'Brush Script MT, cursive' }}>a b c d e f g h i j k l m n o p q r s t u v w x y z</p>
                                            <p className="text-3xl text-[#023047] mt-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>0 1 2 3 4 5 6 7 8 9</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3">Note: This preview uses a system brush font. The actual Tahu font has more expressive, hand-drawn strokes.</p>
                                    </div>
                                    <div className="w-48 flex-shrink-0">
                                        <div className="bg-[#023047] rounded-lg p-4 text-center">
                                            <p className="text-xs text-[#8ecae6] mb-2">FONT FILE</p>
                                            <p className="text-white font-semibold">Tahu.ttf</p>
                                            <p className="text-xs text-[#8ecae6] mt-2">181 glyphs</p>
                                        </div>
                                        <div className="mt-3 space-y-2 text-xs text-gray-500">
                                            <p>Uppercase letters</p>
                                            <p>Lowercase letters</p>
                                            <p>Numbers 0-9</p>
                                            <p>Special characters</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {typography.map((type, index) => (
                                    <div key={type.name} className={`p-6 ${index !== typography.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-start justify-between gap-8">
                                            <div className="flex-1">
                                                <p
                                                    className="text-[#023047] mb-2"
                                                    style={{
                                                        fontSize: type.size,
                                                        fontWeight: type.weight,
                                                        lineHeight: type.lineHeight,
                                                        textTransform: type.transform || 'none',
                                                        letterSpacing: type.transform === 'uppercase' ? '0.05em' : 'normal',
                                                        fontFamily: type.font === 'tahu' ? 'Brush Script MT, cursive' : 'inherit',
                                                    }}
                                                >
                                                    {type.sample}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="font-semibold text-gray-900">{type.name}</p>
                                                <p className="text-xs text-gray-500 font-mono mt-1">
                                                    {type.size} / {type.weight} / {type.lineHeight}
                                                </p>
                                                <p className="text-xs text-[#219ebc] mt-1">{type.note}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Spacing Section */}
                    {activeSection === 'spacing' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Spacing Scale</h2>
                                <p className="text-gray-600">Consistent spacing tokens for layouts and components.</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="space-y-4">
                                    {spacing.map((space) => (
                                        <div key={space.name} className="flex items-center gap-6">
                                            <div className="w-20 text-right">
                                                <span className="font-mono text-sm font-semibold text-[#023047]">{space.name}</span>
                                            </div>
                                            <div
                                                className="bg-[#219ebc] rounded"
                                                style={{ width: space.value, height: '24px' }}
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-900">{space.value}</span>
                                                <span className="text-sm text-gray-500 ml-3">{space.usage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Buttons Section */}
                    {activeSection === 'buttons' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Buttons</h2>
                                <p className="text-gray-600">Interactive button components with multiple variants and states.</p>
                            </div>

                            {/* Primary Buttons */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Buttons</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                        Book Now
                                    </button>
                                    <button className="px-6 py-3 bg-[#023047] text-white font-semibold rounded-lg hover:bg-[#0a4d6b] transition-colors">
                                        Search Flights
                                    </button>
                                    <button className="px-6 py-3 bg-[#219ebc] text-white font-semibold rounded-lg hover:bg-[#1a7a94] transition-colors">
                                        View Details
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">Yellow for primary CTA, Navy for secondary actions, Ocean Blue for tertiary</p>
                            </div>

                            {/* Button Sizes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Sizes</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-3 py-1.5 bg-[#ffb703] text-[#023047] text-xs font-semibold rounded-md hover:bg-[#ffc933] transition-colors">
                                        Small
                                    </button>
                                    <button className="px-4 py-2 bg-[#ffb703] text-[#023047] text-sm font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                        Medium
                                    </button>
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                        Large
                                    </button>
                                    <button className="px-8 py-4 bg-[#ffb703] text-[#023047] text-lg font-semibold rounded-xl hover:bg-[#ffc933] transition-colors">
                                        Extra Large
                                    </button>
                                </div>
                            </div>

                            {/* Outline & Ghost */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Outline & Ghost Variants</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-6 py-3 border-2 border-[#023047] text-[#023047] font-semibold rounded-lg hover:bg-[#023047] hover:text-white transition-colors">
                                        Outline Navy
                                    </button>
                                    <button className="px-6 py-3 border-2 border-[#219ebc] text-[#219ebc] font-semibold rounded-lg hover:bg-[#219ebc] hover:text-white transition-colors">
                                        Outline Blue
                                    </button>
                                    <button className="px-6 py-3 text-[#023047] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                                        Ghost Button
                                    </button>
                                </div>
                            </div>

                            {/* Button States */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Button States</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg">
                                        Default
                                    </button>
                                    <button className="px-6 py-3 bg-[#ffc933] text-[#023047] font-semibold rounded-lg">
                                        Hover
                                    </button>
                                    <button className="px-6 py-3 bg-[#e6a503] text-[#023047] font-semibold rounded-lg ring-2 ring-[#ffb703] ring-offset-2">
                                        Focus
                                    </button>
                                    <button className="px-6 py-3 bg-gray-200 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                                        Disabled
                                    </button>
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Loading
                                    </button>
                                </div>
                            </div>

                            {/* Icon Buttons */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Buttons</h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg flex items-center gap-2 hover:bg-[#ffc933] transition-colors">
                                        <Plane className="w-5 h-5" />
                                        Book Flight
                                    </button>
                                    <button className="px-6 py-3 bg-[#023047] text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-[#0a4d6b] transition-colors">
                                        Continue
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button className="w-12 h-12 bg-[#023047] text-white rounded-full flex items-center justify-center hover:bg-[#0a4d6b] transition-colors">
                                        <Search className="w-5 h-5" />
                                    </button>
                                    <button className="w-10 h-10 border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                                        <Bell className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Inputs Section */}
                    {activeSection === 'inputs' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Inputs</h2>
                                <p className="text-gray-600">Input fields, selects, and form controls for booking flows.</p>
                            </div>

                            {/* Text Inputs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Inputs</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Input</label>
                                        <input
                                            type="text"
                                            placeholder="Enter destination"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">With Icon</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Where to?"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Filled State</label>
                                        <input
                                            type="text"
                                            value="Lagos, Nigeria"
                                            readOnly
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Error State</label>
                                        <input
                                            type="text"
                                            placeholder="Email address"
                                            className="w-full px-4 py-3 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                        />
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Please enter a valid email
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Success State</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value="john@example.com"
                                                readOnly
                                                className="w-full px-4 py-3 pr-12 border-2 border-green-400 rounded-lg bg-green-50"
                                            />
                                            <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Disabled</label>
                                        <input
                                            type="text"
                                            placeholder="Disabled input"
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Select & Date */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select & Date Inputs</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Dropdown</label>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent appearance-none bg-white">
                                            <option>Economy</option>
                                            <option>Premium Economy</option>
                                            <option>Business</option>
                                            <option>First Class</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Input</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox & Radio */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkbox & Radio</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" defaultChecked />
                                            <span className="text-gray-700">Include travel insurance</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" />
                                            <span className="text-gray-700">Add airport transfer</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" />
                                            <span className="text-gray-700">Save for future bookings</span>
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="trip" className="w-5 h-5 border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" defaultChecked />
                                            <span className="text-gray-700">One-way</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="trip" className="w-5 h-5 border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" />
                                            <span className="text-gray-700">Round trip</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="trip" className="w-5 h-5 border-gray-300 text-[#219ebc] focus:ring-[#219ebc]" />
                                            <span className="text-gray-700">Multi-city</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Input</h3>
                                <div className="relative max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search destinations, hotels, flights..."
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent text-lg"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Cards Section */}
                    {activeSection === 'cards' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cards</h2>
                                <p className="text-gray-600">Card components for displaying travel content and services.</p>
                            </div>

                            {/* Service Cards */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Cards</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { icon: Plane, name: 'Flights', color: '#219ebc' },
                                        { icon: Hotel, name: 'Hotels', color: '#fb8500' },
                                        { icon: Ship, name: 'Cargo', color: '#023047' },
                                        { icon: FileText, name: 'Visa', color: '#10b981' },
                                    ].map((service) => (
                                        <div
                                            key={service.name}
                                            className="p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-gray-200 group"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                                style={{ backgroundColor: `${service.color}15` }}
                                            >
                                                <service.icon className="w-6 h-6" style={{ color: service.color }} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-[#023047]">{service.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">Book now →</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Destination Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination Card</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                                        <div className="relative h-48 bg-gradient-to-br from-[#8ecae6] to-[#219ebc]">
                                            <img
                                                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                                                alt="Dubai"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 right-3 bg-[#ffb703] text-[#023047] text-xs font-bold px-2 py-1 rounded">
                                                TRENDING
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <h4 className="font-semibold text-gray-900">Dubai, UAE</h4>
                                            <p className="text-sm text-gray-500 mt-1">From ₦850,000</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">5 Days</span>
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">All Inclusive</span>
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
                                            <h4 className="font-semibold text-gray-900">Paris, France</h4>
                                            <p className="text-sm text-gray-500 mt-1">From ₦1,200,000</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">7 Days</span>
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">Romantic</span>
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
                                            <div className="absolute top-3 right-3 bg-[#fb8500] text-white text-xs font-bold px-2 py-1 rounded">
                                                20% OFF
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white">
                                            <h4 className="font-semibold text-gray-900">Maldives</h4>
                                            <p className="text-sm text-gray-500 mt-1">From ₦2,500,000</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">10 Days</span>
                                                <span className="text-xs bg-[#8ecae6]/20 text-[#023047] px-2 py-1 rounded">Luxury</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Info & Stat Cards</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-5 bg-gradient-to-br from-[#023047] to-[#0a4d6b] rounded-xl text-white">
                                        <p className="text-sm text-[#8ecae6] mb-1">Total Bookings</p>
                                        <p className="text-3xl font-bold">2,847</p>
                                        <p className="text-xs text-[#8ecae6] mt-2">↑ 12% from last month</p>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-[#ffb703] to-[#fb8500] rounded-xl">
                                        <p className="text-sm text-[#023047]/70 mb-1">Revenue</p>
                                        <p className="text-3xl font-bold text-[#023047]">₦45.2M</p>
                                        <p className="text-xs text-[#023047]/70 mt-2">↑ 8% from last month</p>
                                    </div>
                                    <div className="p-5 bg-white border-2 border-[#8ecae6] rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Active Trips</p>
                                        <p className="text-3xl font-bold text-[#023047]">156</p>
                                        <p className="text-xs text-[#219ebc] mt-2">Currently traveling</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Badges Section */}
                    {activeSection === 'badges' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Badges & Tags</h2>
                                <p className="text-gray-600">Status indicators, labels, and category tags.</p>
                            </div>

                            {/* Status Badges */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Badges</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Confirmed</span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Pending</span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Processing</span>
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Cancelled</span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Draft</span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">In Transit</span>
                                </div>
                            </div>

                            {/* Promotional Badges */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotional Badges</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-[#ffb703] text-[#023047] text-sm font-bold rounded">TRENDING</span>
                                    <span className="px-3 py-1 bg-[#fb8500] text-white text-sm font-bold rounded">20% OFF</span>
                                    <span className="px-3 py-1 bg-[#023047] text-white text-sm font-bold rounded">NEW</span>
                                    <span className="px-3 py-1 bg-[#219ebc] text-white text-sm font-bold rounded">POPULAR</span>
                                    <span className="px-3 py-1 bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-[#023047] text-sm font-bold rounded">HOT DEAL</span>
                                </div>
                            </div>

                            {/* Category Tags */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Tags</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Honeymoon</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Family</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Adventure</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Business</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Solo</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Group</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Luxury</span>
                                    <span className="px-3 py-1.5 bg-[#8ecae6]/20 text-[#023047] text-sm rounded-lg">Budget</span>
                                </div>
                            </div>

                            {/* Service Type Tags */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type Tags</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1.5 border border-[#219ebc] text-[#219ebc] text-sm rounded-lg flex items-center gap-1.5">
                                        <Plane className="w-4 h-4" /> Flight
                                    </span>
                                    <span className="px-3 py-1.5 border border-[#fb8500] text-[#fb8500] text-sm rounded-lg flex items-center gap-1.5">
                                        <Hotel className="w-4 h-4" /> Hotel
                                    </span>
                                    <span className="px-3 py-1.5 border border-[#023047] text-[#023047] text-sm rounded-lg flex items-center gap-1.5">
                                        <Ship className="w-4 h-4" /> Cargo
                                    </span>
                                    <span className="px-3 py-1.5 border border-[#10b981] text-[#10b981] text-sm rounded-lg flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" /> Visa
                                    </span>
                                    <span className="px-3 py-1.5 border border-purple-500 text-purple-500 text-sm rounded-lg flex items-center gap-1.5">
                                        <GraduationCap className="w-4 h-4" /> Study
                                    </span>
                                    <span className="px-3 py-1.5 border border-pink-500 text-pink-500 text-sm rounded-lg flex items-center gap-1.5">
                                        <Shield className="w-4 h-4" /> Insurance
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Alerts Section */}
                    {activeSection === 'alerts' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Alerts & Notifications</h2>
                                <p className="text-gray-600">System messages, alerts, and notification components.</p>
                            </div>

                            {/* Alert Types */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Types</h3>

                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-800">Booking Confirmed!</p>
                                        <p className="text-sm text-green-700 mt-1">Your flight to Dubai has been successfully booked. Check your email for confirmation.</p>
                                    </div>
                                    <button className="ml-auto text-green-600 hover:text-green-800">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-800">Travel Advisory</p>
                                        <p className="text-sm text-blue-700 mt-1">Visa requirements have been updated for UK travel. Please review before booking.</p>
                                    </div>
                                    <button className="ml-auto text-blue-600 hover:text-blue-800">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 bg-[#fff3d1] border border-[#ffb703] rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-[#fb8500] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-[#023047]">Payment Pending</p>
                                        <p className="text-sm text-[#023047]/80 mt-1">Your booking will be held for 24 hours. Complete payment to confirm.</p>
                                    </div>
                                    <button className="ml-auto text-[#fb8500] hover:text-[#023047]">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800">Booking Failed</p>
                                        <p className="text-sm text-red-700 mt-1">Payment could not be processed. Please try again or use a different payment method.</p>
                                    </div>
                                    <button className="ml-auto text-red-600 hover:text-red-800">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Toast Notifications */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast Notifications</h3>
                                <div className="space-y-3 max-w-sm">
                                    <div className="p-3 bg-[#023047] text-white rounded-lg shadow-lg flex items-center gap-3">
                                        <Check className="w-5 h-5 text-[#ffb703]" />
                                        <span className="text-sm">Added to your trip!</span>
                                    </div>
                                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#8ecae6]/20 rounded-full flex items-center justify-center">
                                            <Bell className="w-4 h-4 text-[#219ebc]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Flight Reminder</p>
                                            <p className="text-xs text-gray-500">Your flight departs in 24 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Brand Voice Section */}
                    {activeSection === 'voice' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Voice & Tone</h2>
                                <p className="text-gray-600">Warm, encouraging, adventure-forward language that inspires action.</p>
                            </div>

                            {/* Voice Principles */}
                            <div className="bg-gradient-to-br from-[#023047] to-[#0a4d6b] rounded-xl p-6 text-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#ffb703]">Voice Principles</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Use "You", "We", "Together"</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Active verbs: explore, discover, connect</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Adventure-forward phrasing</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Emotional benefits over features</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Warm & encouraging tone</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-[#ffb703]" />
                                            <span>Never intimidating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Example Copy */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Example UI Copy</h3>
                                <div className="space-y-4">
                                    {[
                                        { context: 'Hero Tagline', copy: 'Where will your next story begin?' },
                                        { context: 'CTA Button', copy: 'Start Your Adventure' },
                                        { context: 'Empty State', copy: 'Your journey awaits. Let\'s explore together.' },
                                        { context: 'Success Message', copy: 'You\'re all set! Adventure starts with one step.' },
                                        { context: 'Support', copy: 'We\'ll handle the stress. You enjoy the journey.' },
                                        { context: 'Value Prop', copy: 'Discover experiences that elevate your lifestyle.' },
                                    ].map((item) => (
                                        <div key={item.context} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                            <span className="text-xs font-semibold text-[#219ebc] uppercase tracking-wide w-32 flex-shrink-0">{item.context}</span>
                                            <p className="text-gray-800 italic">"{item.copy}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Do's and Don'ts */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                        <Check className="w-5 h-5" /> Do Say
                                    </h3>
                                    <ul className="space-y-2 text-green-700">
                                        <li>"Explore Dubai's hidden gems"</li>
                                        <li>"Your perfect escape awaits"</li>
                                        <li>"Together, we make travel effortless"</li>
                                        <li>"Step into your next adventure"</li>
                                    </ul>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                                        <X className="w-5 h-5" /> Don't Say
                                    </h3>
                                    <ul className="space-y-2 text-red-700">
                                        <li>"Book a flight" (too transactional)</li>
                                        <li>"Error occurred" (too cold)</li>
                                        <li>"Submit form" (too technical)</li>
                                        <li>"Processing request" (too robotic)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Motion Section */}
                    {activeSection === 'motion' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Motion & Interactions</h2>
                                <p className="text-gray-600">Smooth, optimistic, encouraging interactions that reflect Explorer + Hero archetypes.</p>
                            </div>

                            {/* Motion Principles */}
                            <div className="bg-gradient-to-r from-[#219ebc] to-[#8ecae6] rounded-xl p-6 text-white">
                                <h3 className="text-lg font-semibold mb-4">Motion Principles</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Smooth</p>
                                        <p className="text-sm text-white/80 mt-1">Fluid transitions, no jarring movements</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Optimistic</p>
                                        <p className="text-sm text-white/80 mt-1">Upward, forward momentum</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <p className="font-semibold">Encouraging</p>
                                        <p className="text-sm text-white/80 mt-1">Reward user actions with delight</p>
                                    </div>
                                </div>
                            </div>

                            {/* Micro-interactions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Micro-interactions</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Button Hover (Ripple + Glow)</p>
                                            <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg hover:bg-[#ffc933] hover:shadow-lg hover:shadow-[#ffb703]/30 transition-all duration-200 transform hover:scale-105">
                                                Hover Me
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Card Hover (Lift Effect)</p>
                                            <div className="p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#8ecae6]">
                                                <p className="font-semibold text-[#023047]">Dubai Package</p>
                                                <p className="text-sm text-gray-500">Hover to see lift effect</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Focus Ring (Ocean Blue)</p>
                                            <input
                                                type="text"
                                                placeholder="Click to focus"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#219ebc] focus:border-transparent transition-all duration-200"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Loading State</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-[#8ecae6] border-t-[#023047] rounded-full animate-spin" />
                                                <span className="text-gray-600">Finding adventures...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timing */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Animation Timing</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Instant', duration: '100ms', use: 'Button press, checkbox toggle' },
                                        { name: 'Fast', duration: '200ms', use: 'Hover states, focus rings' },
                                        { name: 'Normal', duration: '300ms', use: 'Card lifts, dropdown open' },
                                        { name: 'Smooth', duration: '500ms', use: 'Page transitions, modals' },
                                    ].map((timing) => (
                                        <div key={timing.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="font-semibold text-[#023047] w-20">{timing.name}</span>
                                            <span className="font-mono text-sm text-[#219ebc] w-16">{timing.duration}</span>
                                            <span className="text-gray-600 text-sm">{timing.use}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Imagery Section */}
                    {activeSection === 'imagery' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Photography & Imagery</h2>
                                <p className="text-gray-600">Images that reflect exploration, adventure, fun, and lifestyle elevation.</p>
                            </div>

                            {/* Imagery Principles */}
                            <div className="bg-gradient-to-br from-[#ffb703] to-[#fb8500] rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-[#023047] mb-4">Imagery Must Reflect</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {['Exploration', 'Adventure', 'Fun', 'Lifestyle Elevation', 'Global Cultures', 'Human Joy'].map((item) => (
                                        <div key={item} className="bg-white/20 rounded-lg p-3 text-center">
                                            <p className="font-semibold text-[#023047]">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Style Guide */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photography Style</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">Bright, high-resolution</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">Natural lighting</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">Warm color tones</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">"Larger than life" composition</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">Dark, moody shots</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">Overly staged/corporate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">Cold, clinical aesthetics</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <X className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-700">Generic stock photos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Example Images */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Examples</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="relative rounded-xl overflow-hidden h-48 group">
                                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" alt="Mountains" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#023047]/80 to-transparent flex items-end p-4">
                                            <p className="text-white text-sm font-medium">Adventure & Discovery</p>
                                        </div>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden h-48 group">
                                        <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&h=300&fit=crop" alt="Friends" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#023047]/80 to-transparent flex items-end p-4">
                                            <p className="text-white text-sm font-medium">Human Joy & Bonding</p>
                                        </div>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden h-48 group">
                                        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop" alt="Lake" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#023047]/80 to-transparent flex items-end p-4">
                                            <p className="text-white text-sm font-medium">Lifestyle Elevation</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-4 italic">"Everything about a good life lives outside your comfort zone."</p>
                            </div>
                        </section>
                    )}

                    {/* Navigation Section */}
                    {activeSection === 'navigation' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Navigation</h2>
                                <p className="text-gray-600">Context-aware navigation system for desktop and mobile devices.</p>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Desktop Navigation</h3>
                                <p className="text-sm text-gray-500 mb-6">3-zone layout: Logo + Services | Adaptive Search Pill | Utilities + CTA</p>

                                {/* Desktop Nav Preview */}
                                <div className="border border-[#f3f4f6] rounded-xl overflow-visible">
                                    <nav className="bg-white border-b border-[#f3f4f6] px-4 py-3">
                                        {/* Row 1: Logo + Services + Utilities */}
                                        <div className="flex items-center justify-between mb-3">
                                            {/* Left: Logo + Services */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-[#ffb703] rounded-lg flex items-center justify-center">
                                                        <Plane className="w-5 h-5 text-[#023047]" />
                                                    </div>
                                                    <span className="text-lg font-bold text-[#023047]">Juyonna</span>
                                                </div>

                                                {/* Services Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowServicesMenu(!showServicesMenu)}
                                                        className="flex items-center gap-2 px-3 py-2 text-[#023047] hover:bg-gray-50 rounded-lg transition-colors"
                                                    >
                                                        <Grid3X3 className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Services</span>
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>

                                                    {showServicesMenu && (
                                                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {['Travel', 'Logistics', 'Lifestyle'].map((cat) => (
                                                                    <div key={cat}>
                                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">{cat}</p>
                                                                        {services.filter(s => s.category === cat).map((service) => (
                                                                            <button key={service.name} className="w-full flex items-center gap-2 px-2 py-2 text-sm text-[#023047] hover:bg-[#8ecae6]/10 rounded-lg transition-colors">
                                                                                <service.icon className="w-4 h-4 text-[#219ebc]" />
                                                                                {service.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Context Links */}
                                                <div className="flex items-center">
                                                    {['Travel', 'Logistics', 'Lifestyle'].map((link) => (
                                                        <button key={link} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#023047] hover:bg-gray-50 rounded-lg transition-colors">
                                                            {link}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: Utilities */}
                                            <div className="flex items-center gap-3">
                                                <button className="text-sm font-medium text-[#023047] hover:text-[#219ebc] transition-colors">
                                                    NGN
                                                </button>
                                                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#023047] transition-colors">
                                                    <HelpCircle className="w-4 h-4" />
                                                    Help
                                                </button>
                                                <button className="px-4 py-2 bg-[#ffb703] text-[#023047] text-sm font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                                    Sign In
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Adaptive Search Pill (Full Width) */}
                                        <div className="bg-gray-50 rounded-full border border-gray-200 p-1 flex items-center">
                                            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
                                                {[
                                                    { id: 'flights', label: 'Flights', icon: Plane },
                                                    { id: 'hotels', label: 'Hotels', icon: Hotel },
                                                    { id: 'cargo', label: 'Cargo', icon: Package },
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveSearchTab(tab.id)}
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${activeSearchTab === tab.id
                                                                ? 'bg-white text-[#023047] shadow-sm'
                                                                : 'text-gray-500 hover:text-[#023047]'
                                                            }`}
                                                    >
                                                        <tab.icon className="w-4 h-4" />
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 px-4 py-2">
                                                <Search className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder={activeSearchTab === 'flights' ? 'Where are you flying to?' : activeSearchTab === 'hotels' ? 'Search hotels by city or name...' : 'Track your shipment...'}
                                                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                                                />
                                            </div>
                                            <button className="bg-[#023047] text-white px-4 py-2 rounded-full hover:bg-[#0a4d6b] transition-colors flex items-center gap-2">
                                                <Search className="w-4 h-4" />
                                                <span className="text-sm font-medium">Search</span>
                                            </button>
                                        </div>
                                    </nav>
                                </div>
                            </div>

                            {/* Desktop Nav Specs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Desktop Specifications</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Left Zone</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Logo (32x32px)</li>
                                            <li>• Services dropdown (Grid icon)</li>
                                            <li>• Context links (Travel, Logistics, Lifestyle)</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Center Zone</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Adaptive Search Pill (rounded-full)</li>
                                            <li>• Tab switcher (Flights/Hotels/Cargo)</li>
                                            <li>• Context-aware placeholder</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Right Zone</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Currency selector (NGN)</li>
                                            <li>• Help link</li>
                                            <li>• CTA: Sign In (Yellow bg)</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold">Visual Style:</span> White (#FFFFFF) background, subtle border-bottom in Gray 100 (#F3F4F6), Navy (#023047) for text and active states.
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Navigation</h3>
                                <p className="text-sm text-gray-500 mb-6">Hybrid super-app pattern: Top bar + Module chips + Bottom tab bar</p>

                                {/* Mobile Nav Preview */}
                                <div className="max-w-sm mx-auto">
                                    <div className="border border-gray-200 rounded-3xl overflow-hidden bg-gray-50 shadow-lg">
                                        {/* Mobile Top Bar */}
                                        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-[#ffb703] rounded-lg flex items-center justify-center">
                                                    <Plane className="w-5 h-5 text-[#023047]" />
                                                </div>
                                                <span className="font-bold text-[#023047]">Juyonna</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="w-10 h-10 flex items-center justify-center text-[#023047]">
                                                    <Search className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                                    className="w-10 h-10 flex items-center justify-center text-[#023047]"
                                                >
                                                    <Menu className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Module Chips Sub-header */}
                                        <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto">
                                            <div className="flex items-center gap-2">
                                                {['Flights', 'Hotels', 'Cargo', 'Visa', 'Tours', 'Insurance'].map((chip, i) => (
                                                    <button
                                                        key={chip}
                                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${i === 0
                                                                ? 'bg-[#023047] text-white'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content Area Placeholder */}
                                        <div className="h-64 bg-gray-50 flex items-center justify-center">
                                            <p className="text-gray-400 text-sm">Page Content</p>
                                        </div>

                                        {/* Mobile Bottom Tab Bar */}
                                        <div className="bg-white border-t border-gray-100 px-2 py-2">
                                            <div className="flex items-center justify-around">
                                                {[
                                                    { icon: Home, label: 'Home', active: true },
                                                    { icon: Briefcase, label: 'My Trips', active: false },
                                                    { icon: MessageSquare, label: 'Messages', active: false },
                                                    { icon: User, label: 'Account', active: false },
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.label}
                                                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${tab.active ? 'text-[#023047]' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <tab.icon className={`w-6 h-6 ${tab.active ? 'fill-current' : ''}`} strokeWidth={tab.active ? 2.5 : 1.5} />
                                                        <span className="text-xs font-medium">{tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Nav Specs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Specifications</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Top Bar</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Logo on left</li>
                                            <li>• Search icon (collapsed)</li>
                                            <li>• Hamburger menu on right</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Sub-header Chips</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Horizontal scroll</li>
                                            <li>• Module quick access</li>
                                            <li>• Active: Navy bg, white text</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-[#023047]">Bottom Tab Bar</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Fixed height: 64px</li>
                                            <li>• 4 icons: Home, Trips, Messages, Account</li>
                                            <li>• Outline icons, fill on active</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation States */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation States</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Logged Out</p>
                                        <div className="flex items-center gap-3">
                                            <button className="px-4 py-2 bg-[#ffb703] text-[#023047] text-sm font-semibold rounded-lg">
                                                Sign In
                                            </button>
                                            <span className="text-sm text-gray-500">Yellow CTA button</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Logged In</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 bg-[#023047] rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-[#023047]">My Account</span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mega Menu Preview */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Mega Menu</h3>
                                <p className="text-sm text-gray-500 mb-4">14 modules organized by category</p>
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="grid grid-cols-4 gap-6">
                                        {['Travel', 'Logistics', 'Lifestyle', 'More'].map((cat, catIndex) => (
                                            <div key={cat}>
                                                <p className="text-xs font-semibold text-[#219ebc] uppercase tracking-wide mb-3">{cat}</p>
                                                <div className="space-y-1">
                                                    {services.filter(s => s.category === cat || (catIndex === 3 && s.category === 'Lifestyle')).slice(0, 4).map((service) => (
                                                        <button key={service.name} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#023047] hover:bg-white rounded-lg transition-colors group">
                                                            <div className="w-8 h-8 bg-white group-hover:bg-[#8ecae6]/20 rounded-lg flex items-center justify-center transition-colors">
                                                                <service.icon className="w-4 h-4 text-[#219ebc]" />
                                                            </div>
                                                            {service.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* CLUSTER 1: Advanced Forms Section */}
                    {activeSection === 'forms' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Form Elements</h2>
                                <p className="text-gray-600">Complex data entry components for Visa Applications, Cargo Quotes, and Study Abroad Forms.</p>
                            </div>

                            {/* Progress Stepper */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Stepper</h3>
                                <p className="text-sm text-gray-500 mb-6">Horizontal timeline for multi-step forms</p>

                                <div className="flex items-center justify-between max-w-2xl mx-auto">
                                    {[
                                        { step: 1, label: 'Info', status: 'completed' },
                                        { step: 2, label: 'Documents', status: 'completed' },
                                        { step: 3, label: 'Review', status: 'active' },
                                        { step: 4, label: 'Pay', status: 'inactive' },
                                    ].map((item, index) => (
                                        <div key={item.step} className="flex items-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${item.status === 'completed' ? 'bg-[#023047] text-white' :
                                                        item.status === 'active' ? 'bg-[#219ebc] text-white ring-4 ring-[#8ecae6]/30' :
                                                            'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {item.status === 'completed' ? <Check className="w-5 h-5" /> : item.step}
                                                </div>
                                                <span className={`mt-2 text-sm font-medium ${item.status === 'active' ? 'text-[#023047]' : 'text-gray-500'
                                                    }`}>{item.label}</span>
                                            </div>
                                            {index < 3 && (
                                                <div className={`w-24 h-1 mx-2 rounded ${item.status === 'completed' ? 'bg-[#023047]' : 'bg-gray-200'
                                                    }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* File Uploader */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Uploader</h3>
                                <p className="text-sm text-gray-500 mb-6">Critical for Visa document uploads</p>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Default State */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Default State</p>
                                        <div className="border-2 border-dashed border-[#8ecae6] rounded-xl p-8 text-center hover:border-[#219ebc] hover:bg-[#8ecae6]/5 transition-all cursor-pointer">
                                            <Upload className="w-10 h-10 text-[#219ebc] mx-auto mb-3" />
                                            <p className="text-[#023047] font-medium">Drag & drop passport page</p>
                                            <p className="text-sm text-gray-500 mt-1">or <span className="text-[#219ebc] font-medium">Browse</span></p>
                                            <p className="text-xs text-gray-400 mt-3">PDF, JPG, PNG up to 5MB</p>
                                        </div>
                                    </div>

                                    {/* Uploading State */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Uploading State</p>
                                        <div className="border-2 border-[#ffb703] rounded-xl p-8 bg-[#fff3d1]/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#ffb703]/20 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-[#fb8500]" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[#023047] font-medium">passport_scan.pdf</p>
                                                    <p className="text-sm text-gray-500">Uploading... 67%</p>
                                                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                        <div className="h-full bg-[#ffb703] rounded-full" style={{ width: '67%' }} />
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selection Cards */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Cards (Radio)</h3>
                                <p className="text-sm text-gray-500 mb-6">Large clickable cards for choices</p>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'oneway', label: 'One Way', desc: 'Single journey' },
                                        { id: 'roundtrip', label: 'Round Trip', desc: 'Return included' },
                                        { id: 'multicity', label: 'Multi-City', desc: 'Multiple stops' },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSelectedTripType(option.id)}
                                            className={`p-5 rounded-xl border-2 text-left transition-all ${selectedTripType === option.id
                                                    ? 'border-[#219ebc] bg-[#8ecae6]/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-[#023047]">{option.label}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTripType === option.id
                                                        ? 'border-[#219ebc] bg-[#219ebc]'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {selectedTripType === option.id && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toggles & Switches */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Toggles & Switches</h3>
                                <p className="text-sm text-gray-500 mb-6">iOS-style toggles with brand colors</p>

                                <div className="space-y-4 max-w-md">
                                    {[
                                        { id: 'notifications', label: 'Push Notifications', desc: 'Receive booking updates' },
                                        { id: 'marketing', label: 'Marketing Emails', desc: 'Deals and promotions' },
                                        { id: 'sms', label: 'SMS Alerts', desc: 'Flight status via SMS' },
                                    ].map((toggle) => (
                                        <div key={toggle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-[#023047]">{toggle.label}</p>
                                                <p className="text-sm text-gray-500">{toggle.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setToggleStates((prev: any) => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
                                                className={`w-12 h-7 rounded-full transition-colors relative ${toggleStates[toggle.id] ? 'bg-[#10b981]' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${toggleStates[toggle.id] ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* CLUSTER 2: Data Tables Section */}
                    {activeSection === 'tables' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Display & Tables</h2>
                                <p className="text-gray-600">Components for Admin Dashboard, Booking History, and Cargo Manifests.</p>
                            </div>

                            {/* Data Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Table</h3>
                                <p className="text-sm text-gray-500 mb-6">With zebra striping, status badges, and actions</p>

                                <div className="overflow-hidden rounded-xl border border-gray-200">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#023047] text-white">
                                                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: 'JT-4521', date: 'Dec 15, 2024', customer: 'Adaeze Okonkwo', status: 'Confirmed', amount: '₦1,250,000', statusColor: 'green' },
                                                { id: 'JT-4520', date: 'Dec 14, 2024', customer: 'Emeka Nwosu', status: 'Pending', amount: '₦890,000', statusColor: 'yellow' },
                                                { id: 'JT-4519', date: 'Dec 14, 2024', customer: 'Fatima Bello', status: 'Processing', amount: '₦2,100,000', statusColor: 'blue' },
                                                { id: 'JT-4518', date: 'Dec 13, 2024', customer: 'Chidi Eze', status: 'Cancelled', amount: '₦450,000', statusColor: 'red' },
                                                { id: 'JT-4517', date: 'Dec 12, 2024', customer: 'Ngozi Uche', status: 'Confirmed', amount: '₦3,200,000', statusColor: 'green' },
                                            ].map((row, i) => (
                                                <tr key={row.id} className={`${i % 2 === 1 ? 'bg-[#f9fafb]' : 'bg-white'} hover:bg-[#8ecae6]/10 transition-colors`}>
                                                    <td className="px-4 py-3 text-sm font-mono text-[#023047]">{row.id}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{row.date}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-[#023047]">{row.customer}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${row.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                                                                row.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                    row.statusColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-red-100 text-red-700'
                                                            }`}>{row.status}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-[#023047]">{row.amount}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagination</h3>
                                <p className="text-sm text-gray-500 mb-6">Table navigation controls</p>

                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">Showing 1-5 of 48 results</p>
                                    <div className="flex items-center gap-2">
                                        <button className="px-3 py-2 text-sm text-gray-500 hover:text-[#023047] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                                            <ChevronLeft className="w-4 h-4" /> Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button className="w-9 h-9 bg-[#023047] text-white text-sm font-medium rounded-lg">1</button>
                                            <button className="w-9 h-9 text-gray-600 text-sm hover:bg-gray-100 rounded-lg">2</button>
                                            <button className="w-9 h-9 text-gray-600 text-sm hover:bg-gray-100 rounded-lg">3</button>
                                            <span className="px-2 text-gray-400">...</span>
                                            <button className="w-9 h-9 text-gray-600 text-sm hover:bg-gray-100 rounded-lg">10</button>
                                        </div>
                                        <button className="px-3 py-2 text-sm text-gray-500 hover:text-[#023047] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                                            Next <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description List</h3>
                                <p className="text-sm text-gray-500 mb-6">Clean layout for Booking Details</p>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-semibold text-[#023047] mb-4">Booking Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { key: 'Booking Reference', value: 'JT-4521' },
                                            { key: 'Ticket Number', value: 'AC-3902-NGN' },
                                            { key: 'Passenger', value: 'Adaeze Okonkwo' },
                                            { key: 'Route', value: 'Lagos → Dubai' },
                                            { key: 'Departure', value: 'Dec 20, 2024 • 14:30' },
                                            { key: 'Return', value: 'Dec 27, 2024 • 09:15' },
                                            { key: 'Class', value: 'Business' },
                                            { key: 'Total Paid', value: '₦1,250,000' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                                                <span className="text-sm text-gray-500">{item.key}</span>
                                                <span className="text-sm font-medium text-[#023047]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* CLUSTER 3: Overlays & Feedback Section */}
                    {activeSection === 'overlays' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Overlays & Feedback</h2>
                                <p className="text-gray-600">Modals, Drawers, Toasts, and Empty States for user interactions.</p>
                            </div>

                            {/* Modal */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Modal / Dialog Box</h3>
                                <p className="text-sm text-gray-500 mb-6">Confirmation dialogs and alerts</p>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2 bg-[#023047] text-white text-sm font-medium rounded-lg hover:bg-[#0a4d6b] transition-colors"
                                >
                                    Open Confirmation Modal
                                </button>

                                {/* Modal Preview (inline) */}
                                <div className="mt-6 relative bg-gray-900/50 rounded-xl p-8 flex items-center justify-center min-h-64">
                                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-[#023047] text-center">Confirm Cancellation</h4>
                                        <p className="text-sm text-gray-500 text-center mt-2">Are you sure you want to cancel this booking? This action cannot be undone and you may be charged a cancellation fee.</p>
                                        <div className="flex gap-3 mt-6">
                                            <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                Keep Booking
                                            </button>
                                            <button className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                                                Yes, Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Side Drawer */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Side Drawer / Filter Sheet</h3>
                                <p className="text-sm text-gray-500 mb-6">Slide-in panels for filters and details</p>

                                <button
                                    onClick={() => setShowDrawer(!showDrawer)}
                                    className="px-4 py-2 bg-[#219ebc] text-white text-sm font-medium rounded-lg hover:bg-[#1a7a94] transition-colors flex items-center gap-2"
                                >
                                    <Filter className="w-4 h-4" /> Open Filter Drawer
                                </button>

                                {/* Drawer Preview (inline) */}
                                <div className="mt-6 relative bg-gray-100 rounded-xl overflow-hidden flex min-h-80">
                                    <div className="flex-1 p-6 flex items-center justify-center">
                                        <p className="text-gray-400">Main Content Area</p>
                                    </div>
                                    <div className="w-80 bg-white border-l border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-semibold text-[#023047] flex items-center gap-2">
                                                <Sliders className="w-5 h-5" /> Filter Results
                                            </h4>
                                            <button className="p-1 hover:bg-gray-100 rounded-lg">
                                                <X className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Price Range</label>
                                                <div className="h-2 bg-gray-200 rounded-full relative">
                                                    <div className="absolute left-1/4 right-1/4 h-full bg-[#219ebc] rounded-full" />
                                                    <div className="absolute left-1/4 -translate-x-1/2 -top-1 w-4 h-4 bg-white border-2 border-[#219ebc] rounded-full" />
                                                    <div className="absolute right-1/4 translate-x-1/2 -top-1 w-4 h-4 bg-white border-2 border-[#219ebc] rounded-full" />
                                                </div>
                                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                    <span>₦100,000</span>
                                                    <span>₦5,000,000</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Star Rating</label>
                                                <div className="space-y-2">
                                                    {[5, 4, 3].map((stars) => (
                                                        <label key={stars} className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#219ebc]" defaultChecked={stars === 5} />
                                                            <span className="text-sm text-gray-600">{stars} Stars</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <button className="w-full py-2.5 bg-[#ffb703] text-[#023047] font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Toast Notifications */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast Notifications</h3>
                                <p className="text-sm text-gray-500 mb-6">Floating feedback messages</p>

                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => setToastVisible({ success: true, error: false })}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Show Success Toast
                                    </button>
                                    <button
                                        onClick={() => setToastVisible({ success: false, error: true })}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Show Error Toast
                                    </button>
                                </div>

                                {/* Toast Previews */}
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-full shadow-lg">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-green-800">Booking Saved Successfully</span>
                                        <button className="text-green-600 hover:text-green-800">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-full shadow-lg">
                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <WifiOff className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-red-800">Connection Failed. Please retry.</span>
                                        <button className="text-red-600 hover:text-red-800">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Empty State */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Empty State</h3>
                                <p className="text-sm text-gray-500 mb-6">When there is no data to display</p>

                                <div className="bg-gray-50 rounded-xl p-12 text-center">
                                    <div className="w-20 h-20 bg-[#8ecae6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Compass className="w-10 h-10 text-[#8ecae6]" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-[#023047] mb-2">No Trips Found</h4>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't booked any trips yet. Start exploring destinations and create unforgettable memories.</p>
                                    <button className="px-6 py-3 bg-[#ffb703] text-[#023047] font-semibold rounded-lg hover:bg-[#ffc933] transition-colors">
                                        Start Searching
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Icons Section */}
                    {activeSection === 'icons' && (
                        <section className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Iconography</h2>
                                <p className="text-gray-600">Lucide icons used throughout the Juyonna platform.</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Icons</h3>
                                <div className="grid grid-cols-6 gap-6">
                                    {[
                                        { icon: Plane, name: 'Flights' },
                                        { icon: Hotel, name: 'Hotels' },
                                        { icon: Ship, name: 'Cargo' },
                                        { icon: FileText, name: 'Visa' },
                                        { icon: GraduationCap, name: 'Study' },
                                        { icon: Shield, name: 'Insurance' },
                                        { icon: Calendar, name: 'Tours' },
                                        { icon: ShoppingBag, name: 'Shop' },
                                        { icon: MapPin, name: 'Protocol' },
                                        { icon: User, name: 'Account' },
                                        { icon: Bell, name: 'Alerts' },
                                        { icon: Search, name: 'Search' },
                                    ].map((item) => (
                                        <div key={item.name} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
                                            <item.icon className="w-6 h-6 text-[#023047]" />
                                            <span className="text-xs text-gray-500">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Sizes</h3>
                                <div className="flex items-end gap-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-4 h-4 text-[#023047]" />
                                        <span className="text-xs text-gray-500">16px</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-5 h-5 text-[#023047]" />
                                        <span className="text-xs text-gray-500">20px</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-[#023047]" />
                                        <span className="text-xs text-gray-500">24px</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-8 h-8 text-[#023047]" />
                                        <span className="text-xs text-gray-500">32px</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-12 h-12 text-[#023047]" />
                                        <span className="text-xs text-gray-500">48px</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Colors</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-[#023047]" />
                                        <span className="text-xs text-gray-500">Navy</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-[#219ebc]" />
                                        <span className="text-xs text-gray-500">Ocean</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-[#ffb703]" />
                                        <span className="text-xs text-gray-500">Yellow</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-[#fb8500]" />
                                        <span className="text-xs text-gray-500">Orange</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Plane className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">Muted</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
