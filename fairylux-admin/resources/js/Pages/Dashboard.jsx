import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ShoppingBag,
    Layers,
    Boxes,
    BarChart3,
    Sparkles,
    ArrowRight,
    Crown,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Plus,
    TrendingUp,
    Clock,
    DollarSign,
    ShoppingCart,
    Users,
    Eye,
    Edit,
    Package,
    Lock
} from 'lucide-react';

export default function Dashboard({ stats = {}, inventory_alerts = [] }) {
    const {
        total_products = 0,
        active_products = 0,
        total_stock_units = 0,
        low_stock_products = 0,
        out_of_stock_products = 0,
        total_categories = 0,
        active_categories = 0,
        total_sales_revenue = 0,
        total_orders = 0,
        pending_orders = 0,
        total_customers = 0
    } = stats;

    const formatCurrency = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return '₱0.00';
        return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Real Dynamic Overview Stats Cards
    const realStatCards = [
        {
            title: 'Total Gown Products',
            value: total_products,
            subtext: `${active_products} currently active in catalog`,
            icon: Crown,
            color: 'text-brand-600',
            bg: 'bg-brand-50/70',
            border: 'border-brand-200/80',
            link: '/products',
            linkText: 'View Gowns'
        },
        {
            title: 'Active Gowns',
            value: active_products,
            subtext: `${total_products - active_products} archived / draft items`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/70',
            border: 'border-emerald-200/80',
            link: '/products',
            linkText: 'Active Catalog'
        },
        {
            title: 'Total Inventory Units',
            value: total_stock_units,
            subtext: 'Aggregated units across all variants',
            icon: Boxes,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/70',
            border: 'border-indigo-200/80',
            link: '/inventory',
            linkText: 'Inventory Matrix'
        },
        {
            title: 'Gown Categories',
            value: total_categories,
            subtext: `${active_categories} active collections`,
            icon: Layers,
            color: 'text-purple-600',
            bg: 'bg-purple-50/70',
            border: 'border-purple-200/80',
            link: '/categories',
            linkText: 'Collections'
        },
        {
            title: 'Low Stock Alerts',
            value: low_stock_products,
            subtext: 'Between 1 and 5 units remaining',
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50/70',
            border: 'border-amber-200/80',
            link: '#stock-alerts',
            linkText: 'Review Items'
        },
        {
            title: 'Out of Stock Gowns',
            value: out_of_stock_products,
            subtext: 'Zero inventory remaining',
            icon: AlertOctagon,
            color: 'text-rose-600',
            bg: 'bg-rose-50/70',
            border: 'border-rose-200/80',
            link: '#stock-alerts',
            linkText: 'Requires Restock'
        }
    ];

    // Real E-Commerce & Analytics Cards (from MySQL Database)
    const analyticsMetricCards = [
        {
            title: 'Total Sales Revenue',
            value: formatCurrency(total_sales_revenue),
            subtext: 'Excludes cancelled orders',
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/15',
            border: 'border-emerald-500/20',
            badge: 'Realized Revenue',
            badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
            link: '/orders',
            linkText: 'View Orders'
        },
        {
            title: 'Total Orders',
            value: Number(total_orders).toLocaleString(),
            subtext: 'All recorded customer orders',
            icon: ShoppingCart,
            color: 'text-sky-400',
            bg: 'bg-sky-500/15',
            border: 'border-sky-500/20',
            badge: 'Lifetime Volume',
            badgeColor: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
            link: '/orders',
            linkText: 'Order History'
        },
        {
            title: 'Pending Orders',
            value: Number(pending_orders).toLocaleString(),
            subtext: 'Awaiting confirmation & processing',
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-500/15',
            border: 'border-amber-500/20',
            badge: pending_orders > 0 ? 'Action Needed' : 'Up to Date',
            badgeColor: pending_orders > 0
                ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                : 'text-slate-300 bg-slate-700/50 border-slate-600',
            link: '/orders?status=pending',
            linkText: 'Manage Pending'
        },
        {
            title: 'Total Customers',
            value: Number(total_customers).toLocaleString(),
            subtext: 'Registered client accounts',
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/15',
            border: 'border-purple-500/20',
            badge: 'Active Accounts',
            badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
            link: '/customers',
            linkText: 'Customer Directory'
        }
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard | FairyLux Gown Boutique Admin" />

            <div className="space-y-8 pb-10">
                {/* Header & Quick Action Bar */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-700 uppercase tracking-widest mb-1.5">
                            <Sparkles className="w-4 h-4 text-brand-500" />
                            <span>Boutique Overview</span>
                            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-500 font-normal">{todayDate}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Live gown inventory, active collections, and boutique operations summary.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <Link
                            href="/products/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-600/20 hover:shadow-lg transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Product</span>
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold border border-slate-200 transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4 text-slate-600" />
                            <span>View Products</span>
                        </Link>
                        <Link
                            href="/categories"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200/90 transition-colors"
                        >
                            <Layers className="w-4 h-4 text-purple-600" />
                            <span>Categories</span>
                        </Link>
                        <Link
                            href="/inventory"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200/90 transition-colors"
                        >
                            <Boxes className="w-4 h-4 text-indigo-600" />
                            <span>Inventory</span>
                        </Link>
                    </div>
                </div>

                {/* 1. Real Database Dynamic Statistic Cards */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-serif font-bold text-slate-900">
                                Product & Inventory Metrics
                            </h2>
                            <p className="text-xs text-slate-500">
                                Real dynamically calculated values directly from the MySQL database
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live MySQL Data
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {realStatCards.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {stat.title}
                                            </span>
                                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-3xl font-serif font-bold text-slate-900">
                                                {stat.value.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {stat.subtext}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <Link
                                            href={stat.link}
                                            className={`text-xs font-semibold ${stat.color} hover:underline inline-flex items-center gap-1`}
                                        >
                                            <span>{stat.linkText}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Low Stock & Out of Stock Product Preview */}
                <div id="stock-alerts" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-serif font-bold text-slate-900">
                                    Stock Attention & Restock Alerts
                                </h2>
                                {(out_of_stock_products > 0 || low_stock_products > 0) && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        {out_of_stock_products + low_stock_products} Gowns Need Attention
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Gowns with zero or low stock (5 or fewer units) requiring boutique replenishment
                            </p>
                        </div>
                        <Link
                            href="/inventory"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                            <span>Manage All Inventory</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {inventory_alerts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5">Gown</th>
                                        <th scope="col" className="px-6 py-3.5">Category</th>
                                        <th scope="col" className="px-6 py-3.5">Price</th>
                                        <th scope="col" className="px-6 py-3.5">Variants</th>
                                        <th scope="col" className="px-6 py-3.5">Stock Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inventory_alerts.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                        {item.featured_image_url ? (
                                                            <img
                                                                src={item.featured_image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Crown className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/products/${item.id}`}
                                                            className="font-medium text-slate-900 hover:text-brand-600 line-clamp-1"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <span className="text-xs text-slate-400 block font-mono">
                                                            SKU: {item.sku}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                    {item.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 font-medium text-slate-900">
                                                {formatCurrency(item.sale_price || item.base_price)}
                                            </td>
                                            <td className="px-6 py-3.5 text-xs text-slate-500">
                                                {item.variants_count} size/color variants
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {item.total_stock === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                                                        Out of Stock (0 units)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                        Low Stock ({item.total_stock} left)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/products/${item.id}`}
                                                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                        title="View Product Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/products/${item.id}/edit`}
                                                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Edit Product & Inventory"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Inventory Status Healthy</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                All gown products currently have adequate stock units across their variants. No immediate stock alerts detected.
                            </p>
                        </div>
                    )}
                </div>

                {/* 3. Real E-Commerce & Sales Analytics Section */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    {/* Background glow styling */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                        E-Commerce Analytics
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Live MySQL Data
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                                    Sales, Order & Customer Analytics
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    Real-time transaction totals, pending fulfillment counts, and client accounts directly from the database.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                                <Link
                                    href="/orders"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white shadow-sm transition-all"
                                >
                                    <ShoppingCart className="w-3.5 h-3.5 text-brand-400" />
                                    <span>Manage Orders</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                </Link>
                            </div>
                        </div>

                        {/* Real Analytics Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
                            {analyticsMetricCards.map((card, idx) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={idx}
                                        className={`bg-slate-800/60 rounded-xl p-5 border ${card.border} backdrop-blur-sm flex flex-col justify-between hover:bg-slate-800/90 transition-all shadow-sm`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                    {card.title}
                                                </span>
                                                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <div className="mt-3.5 flex items-baseline justify-between gap-2">
                                                <span className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                                                    {card.value}
                                                </span>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${card.badgeColor}`}>
                                                    {card.badge}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 mt-1.5">
                                                {card.subtext}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                                            <Link
                                                href={card.link}
                                                className={`text-xs font-semibold ${card.color} hover:underline inline-flex items-center gap-1`}
                                            >
                                                <span>{card.linkText}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
