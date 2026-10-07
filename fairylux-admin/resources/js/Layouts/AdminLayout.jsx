import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Layers,
    Receipt,
    Users,
    Boxes,
    BarChart3,
    Menu,
    X,
    ChevronRight,
    LogOut,
    Shield
} from 'lucide-react';

export default function AdminLayout({ children, title = 'Dashboard' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url, props } = usePage();
    const authUser = props.auth?.user;

    const navigation = [
        { name: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard, pattern: '/dashboard' },
        { name: 'Products',   href: '/products',   icon: ShoppingBag,     pattern: '/products' },
        { name: 'Categories', href: '/categories', icon: Layers,          pattern: '/categories' },
        { name: 'Orders',     href: '/orders',     icon: Receipt,         pattern: '/orders' },
        { name: 'Customers',  href: '/customers',  icon: Users,           pattern: '/customers' },
        { name: 'Inventory',  href: '/inventory',  icon: Boxes,           pattern: '/inventory' },
        { name: 'Reports',    href: '/reports',    icon: BarChart3,       pattern: '/reports' },
    ];

    const isActive = (pattern) => {
        if (pattern === '/dashboard') {
            return url === '/' || url === '/dashboard';
        }
        return url.startsWith(pattern);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-charcoal-900/70 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Fixed Sidebar ─────────────────────────────────── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-charcoal-900 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col border-r border-charcoal-800 shrink-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-charcoal-800 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        {/* FL Monogram */}
                        <div className="w-8 h-8 rounded-lg border border-brand-600/50 bg-brand-600/10 flex items-center justify-center shrink-0">
                            <span className="font-serif text-sm font-bold text-brand-400 tracking-wide">FL</span>
                        </div>
                        <div>
                            <span className="block font-serif text-sm font-bold tracking-[0.12em] text-white uppercase">
                                FairyLux
                            </span>
                            <span className="block text-[9px] uppercase tracking-[0.2em] text-brand-500 font-semibold">
                                Admin Portal
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-charcoal-400 hover:text-white p-1 rounded-lg hover:bg-charcoal-800 transition-colors"
                        aria-label="Close Sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold text-charcoal-600 uppercase tracking-widest mb-3">
                        Navigation
                    </p>
                    {navigation.map((item) => {
                        const active = isActive(item.pattern);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                    active
                                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                                        : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`w-4 h-4 shrink-0 transition-colors ${
                                            active ? 'text-white' : 'text-charcoal-500 group-hover:text-brand-400'
                                        }`}
                                    />
                                    <span>{item.name}</span>
                                </div>
                                <ChevronRight
                                    className={`w-3.5 h-3.5 transition-all ${
                                        active ? 'text-brand-200 opacity-100' : 'text-charcoal-700 opacity-0 group-hover:opacity-100'
                                    }`}
                                />
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer — Profile + Logout */}
                <div className="p-3 border-t border-charcoal-800 space-y-2 shrink-0">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-charcoal-800/60 border border-charcoal-700">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                            {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{authUser?.name || 'Administrator'}</p>
                            <div className="flex items-center gap-1 text-[10px] text-brand-500 truncate">
                                <Shield className="w-3 h-3 shrink-0" />
                                <span className="truncate">{authUser?.role || 'Administrator'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-medium text-xs transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Top Navigation Bar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none transition-colors"
                            aria-label="Open Navigation Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h2 className="text-base font-serif font-bold text-charcoal-900 tracking-tight leading-none">
                                {title}
                            </h2>
                            <p className="text-[10px] text-charcoal-400 font-medium uppercase tracking-widest mt-0.5">
                                FairyLux Admin
                            </p>
                        </div>
                    </div>

                    {/* Header Right: Admin Badge + Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-charcoal-800">{authUser?.name || 'Administrator'}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-200">
                                    <Shield className="w-2.5 h-2.5" />
                                    {authUser?.role || 'Admin'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
