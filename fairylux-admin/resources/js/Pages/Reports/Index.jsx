import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart3,
    TrendingUp,
    Sparkles,
    DollarSign,
    ShoppingCart,
    ShoppingBag,
    Receipt,
    Users,
    Boxes,
    Layers,
    Crown,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Filter,
    Tag,
    ChevronRight,
    Info,
    ShieldCheck,
    Check,
    RefreshCw
} from 'lucide-react';

export default function ReportsIndex() {
    // Interactive filter state for presentation demo
    const [timeRange, setTimeRange] = useState('6m'); // '30d' | '3m' | '6m' | '1y'
    const [revenueFilter, setRevenueFilter] = useState('all'); // 'all' | 'rentals' | 'sales'
    const [activeMonthIdx, setActiveMonthIdx] = useState(5); // Default to June (latest)
    const [exportNotice, setExportNotice] = useState(false);

    const handleExport = () => {
        setExportNotice(true);
        setTimeout(() => setExportNotice(false), 3000);
    };

    // Format Philippine Peso currency
    const formatCurrency = (amount) => {
        return `₱${Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // ──────────────────────────────────────────────────────────────────────────
    // STATIC DEMO DATA (Realistic FairyLux Boutique Figures)
    // ──────────────────────────────────────────────────────────────────────────

    const kpiMetrics = [
        {
            title: 'Total Sales & Rentals',
            value: '₱2,845,600.00',
            raw: 2845600,
            growth: '+18.4%',
            growthPositive: true,
            period: 'vs previous 6 months',
            subtext: '₱1,920,400 rentals • ₱925,200 purchases',
            icon: DollarSign,
            color: 'text-brand-600',
            bg: 'bg-brand-50/80',
            border: 'border-brand-200/90'
        },
        {
            title: 'Total Orders',
            value: '342',
            raw: 342,
            growth: '+12.6%',
            growthPositive: true,
            period: 'vs previous 6 months',
            subtext: '286 bookings completed • 56 retail sales',
            icon: ShoppingBag,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/80',
            border: 'border-indigo-200/90'
        },
        {
            title: 'Average Order Value',
            value: '₱8,320.47',
            raw: 8320.47,
            growth: '+5.2%',
            growthPositive: true,
            period: 'vs previous 6 months',
            subtext: 'Rentals avg ₱6,715 • Purchases avg ₱16,520',
            icon: Receipt,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/80',
            border: 'border-emerald-200/90'
        },
        {
            title: 'Total Customers',
            value: '284',
            raw: 284,
            growth: '+24.1%',
            growthPositive: true,
            period: 'vs previous 6 months',
            subtext: '73% repeat bookings & bride referrals',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50/80',
            border: 'border-purple-200/90'
        }
    ];

    // Monthly Trend Chart Data (Jan - Jun 2026)
    const monthlyData = [
        { month: 'Jan', label: 'January 2026',  rentals: 210000, sales: 110000, total: 320000, orders: 42 },
        { month: 'Feb', label: 'February 2026', rentals: 275000, sales: 135000, total: 410000, orders: 49 },
        { month: 'Mar', label: 'March 2026',    rentals: 390000, sales: 170000, total: 560000, orders: 68 }, // Wedding season kick-off
        { month: 'Apr', label: 'April 2026',    rentals: 340000, sales: 150000, total: 490000, orders: 58 },
        { month: 'May', label: 'May 2026',      rentals: 395000, sales: 185000, total: 580000, orders: 71 }, // Prom & Gala peak
        { month: 'Jun', label: 'June 2026',     rentals: 310400, sales: 175200, total: 485600, orders: 54 },
    ];

    // Category Distribution Data
    const categoryData = [
        { name: 'Wedding Gowns',   percentage: 42, revenue: 1195152, orders: 98, color: 'bg-brand-600',   textColor: 'text-brand-700',   bgLight: 'bg-brand-50' },
        { name: 'Ball Gowns',      percentage: 24, revenue: 682944,  orders: 76, color: 'bg-purple-600',  textColor: 'text-purple-700',  bgLight: 'bg-purple-50' },
        { name: 'Evening Gowns',   percentage: 16, revenue: 455296,  orders: 68, color: 'bg-indigo-600',  textColor: 'text-indigo-700',  bgLight: 'bg-indigo-50' },
        { name: 'Prom Gowns',      percentage: 12, revenue: 341472,  orders: 54, color: 'bg-amber-500',   textColor: 'text-amber-700',   bgLight: 'bg-amber-50' },
        { name: 'Bridesmaid Gowns',percentage: 6,  revenue: 170736,  orders: 46, color: 'bg-rose-500',    textColor: 'text-rose-700',    bgLight: 'bg-rose-50' },
    ];

    // Orders by Status Data
    const orderStatusData = [
        { status: 'Completed / Returned', count: 218, pct: 63.7, color: '#10b981', ringColor: 'ring-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
        { status: 'Active Rental / Fitting', count: 64, pct: 18.7, color: '#b45309', ringColor: 'ring-brand-600', bg: 'bg-brand-50', text: 'text-brand-700' },
        { status: 'Pending Confirmation',  count: 38, pct: 11.1, color: '#f59e0b', ringColor: 'ring-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
        { status: 'Cancelled / Refunded',  count: 22, pct: 6.5,  color: '#f43f5e', ringColor: 'ring-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
    ];

    // Top Selling Gowns Table Data
    const topGowns = [
        {
            id: 1,
            name: 'Aurelia Royal Cathedral Lace Gown',
            category: 'Wedding Gowns',
            sku: 'FL-WED-001',
            price: 9500,
            unitsRented: 38,
            revenue: 361000,
            growth: '+28%',
            stockStatus: 'In Stock',
            stockUnits: 14,
            image: '/storage/products/aurelia-royal-cathedral-lace-gown/main.jpg'
        },
        {
            id: 2,
            name: 'Seraphina Off-Shoulder Mikado Gown',
            category: 'Wedding Gowns',
            sku: 'FL-WED-002',
            price: 8500,
            unitsRented: 32,
            revenue: 272000,
            growth: '+19%',
            stockStatus: 'In Stock',
            stockUnits: 12,
            image: '/storage/products/seraphina-off-shoulder-mikado-gown/main.jpg'
        },
        {
            id: 21,
            name: 'Majestic Duchess Satin Grand Ball Gown',
            category: 'Ball Gowns',
            sku: 'FL-BAL-001',
            price: 8500,
            unitsRented: 29,
            revenue: 246500,
            growth: '+15%',
            stockStatus: 'Low Stock',
            stockUnits: 4,
            image: '/storage/products/majestic-duchess-satin-grand-ball-gown/main.jpg'
        },
        {
            id: 6,
            name: 'Cassiopeia Backless Iridescent Sequin Gown',
            category: 'Prom Gowns',
            sku: 'FL-PRM-001',
            price: 6800,
            unitsRented: 27,
            revenue: 183600,
            growth: '+22%',
            stockStatus: 'In Stock',
            stockUnits: 18,
            image: '/storage/products/cassiopeia-backless-iridescent-sequin-gown/main.jpg'
        },
        {
            id: 11,
            name: 'Nocturne Velvet High-Slit Gala Gown',
            category: 'Evening Gowns',
            sku: 'FL-EVE-001',
            price: 6800,
            unitsRented: 24,
            revenue: 163200,
            growth: '+11%',
            stockStatus: 'In Stock',
            stockUnits: 9,
            image: '/storage/products/nocturne-velvet-high-slit-gala-gown/main.jpg'
        },
        {
            id: 3,
            name: 'Genevieve 3D Floral Appliqué Mermaid Gown',
            category: 'Wedding Gowns',
            sku: 'FL-WED-003',
            price: 9500,
            unitsRented: 21,
            revenue: 199500,
            growth: '+8%',
            stockStatus: 'Low Stock',
            stockUnits: 3,
            image: '/storage/products/genevieve-3d-floral-applique-mermaid-gown/main.jpg'
        }
    ];

    // Recent Sales Summary Transactions
    const recentSales = [
        {
            orderId: 'FL-9042',
            client: 'Maria Isabella Santos',
            gown: 'Aurelia Royal Cathedral Lace Gown',
            category: 'Wedding Gowns',
            color: 'Ivory White',
            size: 'M',
            amount: 9500,
            type: 'Rental',
            status: 'Completed',
            date: '2 hours ago',
            statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
            orderId: 'FL-9041',
            client: 'Sofia Beatriz Rodriguez',
            gown: 'Cassiopeia Backless Iridescent Sequin Gown',
            category: 'Prom Gowns',
            color: 'Midnight Navy',
            size: 'S',
            amount: 6800,
            type: 'Rental',
            status: 'Fitting Scheduled',
            date: '5 hours ago',
            statusBg: 'bg-amber-50 text-amber-700 border-amber-200'
        },
        {
            orderId: 'FL-9040',
            client: 'Beatrice Camille Lim',
            gown: 'Majestic Duchess Satin Grand Ball Gown',
            category: 'Ball Gowns',
            color: 'Royal Emerald',
            size: 'L',
            amount: 8500,
            type: 'Rental',
            status: 'Out for Rental',
            date: 'Yesterday, 4:15 PM',
            statusBg: 'bg-brand-50 text-brand-700 border-brand-200'
        },
        {
            orderId: 'FL-9039',
            client: 'Chloe Marie Tan',
            gown: 'Juliette Flutter-Sleeve Chiffon Gown',
            category: 'Bridesmaid Gowns',
            color: 'Blush Pink',
            size: 'XS',
            amount: 4200,
            type: 'Rental',
            status: 'Completed',
            date: 'Yesterday, 11:30 AM',
            statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        {
            orderId: 'FL-9038',
            client: 'Isabelle Nicole Garcia',
            gown: 'Versailles Gold Brocade Basque Gown',
            category: 'Ball Gowns',
            color: 'Champagne Gold',
            size: 'M',
            amount: 8900,
            type: 'Rental',
            status: 'Returned & Cleaned',
            date: 'Jun 10, 2026',
            statusBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        },
        {
            orderId: 'FL-9037',
            client: 'Danielle Alessandra Ramos',
            gown: 'Solstice Cowl-Back Metallic Slip Gown',
            category: 'Evening Gowns',
            color: 'Silver Mist',
            size: 'S',
            amount: 17500,
            type: 'Retail Purchase',
            status: 'Delivered',
            date: 'Jun 09, 2026',
            statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }
    ];

    // SVG Chart Geometry Constants
    const chartHeight = 220;
    const chartWidth = 600;
    const maxVal = 650000;
    const getChartY = (val) => chartHeight - (val / maxVal) * (chartHeight - 30);
    const getChartX = (index) => 40 + (index / (monthlyData.length - 1)) * (chartWidth - 80);

    const activeMonth = monthlyData[activeMonthIdx];

    return (
        <AdminLayout title="Reports">
            <Head title="Reports & Analytics | FairyLux Admin" />

            <div className="space-y-8 pb-12">
                {/* ── Page Header & Controls ────────────────────────── */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                                Boutique Intelligence
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                                <Info className="w-3 h-3 text-amber-600" />
                                Demo Data • Sample Simulation
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            Reports & Boutique Analytics
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
                            Comprehensive financial reporting, gown rental trajectory, category share, and inventory turnover metrics.
                        </p>
                    </div>

                    {/* Filter Pills & Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs font-semibold text-slate-600">
                            {[
                                { key: '30d', label: '30 Days' },
                                { key: '3m',  label: '3 Months' },
                                { key: '6m',  label: '6 Months' },
                                { key: '1y',  label: '1 Year' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setTimeRange(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        timeRange === tab.key
                                            ? 'bg-white text-slate-900 shadow-sm font-bold'
                                            : 'hover:text-slate-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold shadow-sm transition-colors border border-charcoal-800"
                        >
                            {exportNotice ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Export Prepared</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 text-brand-400" />
                                    <span>Export Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notice Alert for Demo Data */}
                <div className="bg-gradient-to-r from-brand-50/90 via-amber-50/60 to-slate-50 border border-brand-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-600/20">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-950 font-serif text-sm sm:text-base">
                                Reports Demonstration Environment
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-brand-200/70 text-brand-900">
                                Demo Mode
                            </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">
                            This reporting interface displays realistic static demonstration data designed for presentation and evaluation. It illustrates total sales, rental distribution, silhouette demand, and stock turnover without affecting active database records.
                        </p>
                    </div>
                </div>

                {/* ── 1. Executive Metric Cards (4 KPIs) ─────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {kpiMetrics.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={idx}
                                className={`bg-white rounded-2xl p-5 sm:p-6 border ${kpi.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {kpi.title}
                                        </span>
                                        <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                                            {kpi.value}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span
                                            className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                                                kpi.growthPositive
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-rose-50 text-rose-700'
                                            }`}
                                        >
                                            {kpi.growthPositive ? (
                                                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                            ) : (
                                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                                            )}
                                            {kpi.growth}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {kpi.period}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 leading-snug">
                                        {kpi.subtext}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── 2. Charts Section: Monthly Trend & Status ────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Sales Trend Chart (Span 2) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-serif font-bold text-slate-900">
                                            Monthly Sales & Rental Trend
                                        </h2>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">
                                            H1 2026
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Aggregated rental bookings vs retail sales trajectory across 6 months
                                    </p>
                                </div>

                                {/* Revenue filter toggle */}
                                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'rentals', label: 'Rentals' },
                                        { id: 'sales', label: 'Purchases' }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setRevenueFilter(f.id)}
                                            className={`px-2.5 py-1 rounded-lg transition-colors ${
                                                revenueFilter === f.id
                                                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                                                    : 'hover:text-slate-900'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Point Highlight Box */}
                            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-serif font-bold text-xs">
                                        {activeMonth.month}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Selected Period</div>
                                        <div className="text-sm font-bold text-slate-900">{activeMonth.label}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Total Revenue</span>
                                        <span className="font-bold text-slate-900 text-sm">
                                            {revenueFilter === 'rentals'
                                                ? formatCurrency(activeMonth.rentals)
                                                : revenueFilter === 'sales'
                                                ? formatCurrency(activeMonth.sales)
                                                : formatCurrency(activeMonth.total)}
                                        </span>
                                    </div>
                                    <div className="border-l border-slate-200 pl-4">
                                        <span className="text-slate-400 block text-[11px]">Completed Orders</span>
                                        <span className="font-bold text-brand-700 text-sm">
                                            {activeMonth.orders} orders
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SVG Trend Chart Visualization */}
                            <div className="mt-6">
                                <div className="h-64 w-full relative">
                                    <svg
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                        className="w-full h-full overflow-visible"
                                    >
                                        <defs>
                                            <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#b45309" stopOpacity="0.28" />
                                                <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Horizontal Grid lines */}
                                        {[600000, 450000, 300000, 150000, 0].map((val) => {
                                            const y = getChartY(val);
                                            return (
                                                <g key={val}>
                                                    <line
                                                        x1="35"
                                                        y1={y}
                                                        x2={chartWidth - 20}
                                                        y2={y}
                                                        stroke="#f1f5f9"
                                                        strokeWidth="1"
                                                    />
                                                    <text
                                                        x="30"
                                                        y={y + 4}
                                                        textAnchor="end"
                                                        className="text-[10px] fill-slate-400 font-mono"
                                                    >
                                                        ₱{(val / 1000).toFixed(0)}k
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Area fill for Total or Filter */}
                                        <path
                                            d={`
                                                M ${getChartX(0)} ${chartHeight}
                                                ${monthlyData.map((d, i) => {
                                                    const val = revenueFilter === 'rentals' ? d.rentals : revenueFilter === 'sales' ? d.sales : d.total;
                                                    return `L ${getChartX(i)} ${getChartY(val)}`;
                                                }).join(' ')}
                                                L ${getChartX(monthlyData.length - 1)} ${chartHeight}
                                                Z
                                            `}
                                            fill="url(#brandGradient)"
                                        />

                                        {/* Primary Trend Line */}
                                        <path
                                            d={`
                                                M ${getChartX(0)} ${getChartY(
                                                    revenueFilter === 'rentals' ? monthlyData[0].rentals : revenueFilter === 'sales' ? monthlyData[0].sales : monthlyData[0].total
                                                )}
                                                ${monthlyData.map((d, i) => {
                                                    const val = revenueFilter === 'rentals' ? d.rentals : revenueFilter === 'sales' ? d.sales : d.total;
                                                    return `L ${getChartX(i)} ${getChartY(val)}`;
                                                }).join(' ')}
                                            `}
                                            fill="none"
                                            stroke="#b45309"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Secondary line if viewing all (Rentals breakdown) */}
                                        {revenueFilter === 'all' && (
                                            <path
                                                d={`
                                                    M ${getChartX(0)} ${getChartY(monthlyData[0].rentals)}
                                                    ${monthlyData.map((d, i) => `L ${getChartX(i)} ${getChartY(d.rentals)}`).join(' ')}
                                                `}
                                                fill="none"
                                                stroke="#64748b"
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                                strokeLinecap="round"
                                            />
                                        )}

                                        {/* Data Points with Click Handler */}
                                        {monthlyData.map((d, i) => {
                                            const val = revenueFilter === 'rentals' ? d.rentals : revenueFilter === 'sales' ? d.sales : d.total;
                                            const cx = getChartX(i);
                                            const cy = getChartY(val);
                                            const isSelected = activeMonthIdx === i;

                                            return (
                                                <g
                                                    key={d.month}
                                                    onClick={() => setActiveMonthIdx(i)}
                                                    className="cursor-pointer group"
                                                >
                                                    {/* Hit box */}
                                                    <rect
                                                        x={cx - 20}
                                                        y={0}
                                                        width={40}
                                                        height={chartHeight}
                                                        fill="transparent"
                                                    />

                                                    {isSelected && (
                                                        <line
                                                            x1={cx}
                                                            y1={cy}
                                                            x2={cx}
                                                            y2={chartHeight}
                                                            stroke="#b45309"
                                                            strokeWidth="1.5"
                                                            strokeDasharray="2 2"
                                                        />
                                                    )}

                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isSelected ? 6 : 4}
                                                        className={`${
                                                            isSelected
                                                                ? 'fill-brand-600 stroke-white'
                                                                : 'fill-white stroke-brand-600 group-hover:fill-brand-100'
                                                        } transition-all`}
                                                        strokeWidth={isSelected ? 3 : 2}
                                                    />

                                                    {/* X-axis Label */}
                                                    <text
                                                        x={cx}
                                                        y={chartHeight + 18}
                                                        textAnchor="middle"
                                                        className={`text-xs font-semibold ${
                                                            isSelected
                                                                ? 'fill-slate-900 font-bold'
                                                                : 'fill-slate-500'
                                                        }`}
                                                    >
                                                        {d.month}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Chart Legend */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-brand-600 inline-block"></span>
                                    <span className="text-slate-600 font-medium">Total Monthly Revenue</span>
                                </div>
                                {revenueFilter === 'all' && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-500 inline-block"></span>
                                        <span className="text-slate-500">Rental Component Only</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-slate-400 text-[11px]">
                                Click any month point to inspect details
                            </span>
                        </div>
                    </div>

                    {/* Orders by Status Chart (Span 1) */}
                    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-serif font-bold text-slate-900">
                                        Orders by Status
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Rental lifecycle fulfillment (342 Total)
                                    </p>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                    <Receipt className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Donut Chart Visual Representation */}
                            <div className="my-6 flex items-center justify-center relative">
                                <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[-90deg]">
                                    {/* Donut Segments using strokeDasharray */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="65"
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth="24"
                                    />
                                    {/* 1. Completed (63.7% -> 260 of 408.4) */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="65"
                                        fill="transparent"
                                        stroke="#10b981"
                                        strokeWidth="24"
                                        strokeDasharray="260.1 408.4"
                                        strokeDashoffset="0"
                                    />
                                    {/* 2. Active Rental (18.7% -> 76.4 of 408.4) */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="65"
                                        fill="transparent"
                                        stroke="#b45309"
                                        strokeWidth="24"
                                        strokeDasharray="76.4 408.4"
                                        strokeDashoffset="-260.1"
                                    />
                                    {/* 3. Pending (11.1% -> 45.3 of 408.4) */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="65"
                                        fill="transparent"
                                        stroke="#f59e0b"
                                        strokeWidth="24"
                                        strokeDasharray="45.3 408.4"
                                        strokeDashoffset="-336.5"
                                    />
                                    {/* 4. Cancelled (6.5% -> 26.5 of 408.4) */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r="65"
                                        fill="transparent"
                                        stroke="#f43f5e"
                                        strokeWidth="24"
                                        strokeDasharray="26.5 408.4"
                                        strokeDashoffset="-381.8"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <span className="font-serif font-bold text-2xl text-slate-900">342</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                        Orders
                                    </span>
                                </div>
                            </div>

                            {/* Status List Breakdown */}
                            <div className="space-y-2.5">
                                {orderStatusData.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: s.color }}
                                            />
                                            <span className="text-xs font-medium text-slate-700">
                                                {s.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900">
                                                {s.count}
                                            </span>
                                            <span className="text-[11px] text-slate-400 w-11 text-right">
                                                ({s.pct}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Fulfillment Health</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                93.5% Success Rate
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── 3. Category Breakdown & Inventory Summary ───────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales by Category Chart (Span 2) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-serif font-bold text-slate-900">
                                        Sales & Rental Share by Category
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Revenue distribution across all 5 FairyLux boutique collections
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                    5 Collections
                                </span>
                            </div>

                            {/* Proportional Stack Bar */}
                            <div className="my-6">
                                <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
                                    {categoryData.map((cat, i) => (
                                        <div
                                            key={i}
                                            style={{ width: `${cat.percentage}%` }}
                                            className={`${cat.color} h-full transition-all`}
                                            title={`${cat.name}: ${cat.percentage}%`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Category Cards List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {categoryData.map((cat, i) => (
                                    <div
                                        key={i}
                                        className="p-3.5 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-8 rounded-full ${cat.color} shrink-0`} />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                                                <span className="text-[11px] text-slate-500">
                                                    {cat.orders} rental fittings
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-900">
                                                {formatCurrency(cat.revenue)}
                                            </div>
                                            <span className={`text-[11px] font-bold ${cat.textColor}`}>
                                                {cat.percentage}% share
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <span>Top Performing Category: <strong className="text-slate-900">Wedding Gowns</strong> (₱1.19M)</span>
                            <span className="text-brand-700 font-semibold">42% of Boutique Turnover</span>
                        </div>
                    </div>

                    {/* Inventory Summary (Span 1) */}
                    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-serif font-bold text-slate-900">
                                        Inventory Summary
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Showroom & circulating units
                                    </p>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                    <Boxes className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Inventory Metric Highlights */}
                            <div className="space-y-4 my-5">
                                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                                            Total Stock Units
                                        </span>
                                        <span className="font-serif font-bold text-2xl text-white">418 Units</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-brand-400 block font-semibold">Asset Value</span>
                                        <span className="text-sm font-bold text-white">₱3,540,000</span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs">
                                    {/* 1. Available */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-600 font-medium">Available in Showroom</span>
                                            <span className="font-bold text-slate-900">338 units (80.9%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80.9%' }} />
                                        </div>
                                    </div>

                                    {/* 2. In Circulation / Rented */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-600 font-medium">Out on Rental / Fittings</span>
                                            <span className="font-bold text-brand-700">64 units (15.3%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full bg-brand-600 rounded-full" style={{ width: '15.3%' }} />
                                        </div>
                                    </div>

                                    {/* 3. Reserved / Inspection */}
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-600 font-medium">Under Cleaning / Inspection</span>
                                            <span className="font-bold text-amber-600">16 units (3.8%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '3.8%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                                    <div className="flex justify-between">
                                        <span>Active Silhouettes:</span>
                                        <strong className="text-slate-900">24 Gowns</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Size/Color Variants:</span>
                                        <strong className="text-slate-900">104 SKUs</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Stock Turn Rate:</span>
                                        <strong className="text-brand-700">3.8x / Year</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <Link
                                href="/inventory"
                                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
                            >
                                <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Inspect Full Inventory Matrix</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── 4. Top Selling Gowns Table ──────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-serif font-bold text-slate-900">
                                    Top-Selling & Highest Rented Gowns
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                                    Top 6 Silhouettes
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Ranked by rental frequency, client fitting volume, and total generated turnover
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Crown className="w-4 h-4 text-brand-500" />
                            <span>Sorted by Rental Revenue</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">Gown Silhouette</th>
                                    <th scope="col" className="px-6 py-3.5">Category</th>
                                    <th scope="col" className="px-6 py-3.5">Rental Rate</th>
                                    <th scope="col" className="px-6 py-3.5 text-center">Fittings / Bookings</th>
                                    <th scope="col" className="px-6 py-3.5 text-right">Gross Turnover</th>
                                    <th scope="col" className="px-6 py-3.5 text-center">Growth</th>
                                    <th scope="col" className="px-6 py-3.5 text-right">Stock Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topGowns.map((gown, idx) => (
                                    <tr key={gown.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={gown.image}
                                                        alt={gown.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 line-clamp-1">
                                                        {idx + 1}. {gown.name}
                                                    </div>
                                                    <span className="text-xs text-slate-400 block font-mono">
                                                        SKU: {gown.sku}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {gown.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 font-medium text-slate-900">
                                            {formatCurrency(gown.price)}
                                        </td>
                                        <td className="px-6 py-3.5 text-center font-bold text-slate-800">
                                            {gown.unitsRented} bookings
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-serif font-bold text-slate-900 text-base">
                                            {formatCurrency(gown.revenue)}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                                {gown.growth}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            {gown.stockStatus === 'In Stock' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {gown.stockUnits} Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {gown.stockUnits} Low Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── 5. Recent Sales Summary ─────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-serif font-bold text-slate-900">
                                    Recent Sales & Rental Transactions
                                </h2>
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600">
                                    Demo Log
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Chronological audit stream of latest client fittings, rental returns, and checkouts
                            </p>
                        </div>
                        <span className="text-xs text-slate-400">
                            Showing latest 6 transactions
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">Order ID</th>
                                    <th scope="col" className="px-6 py-3.5">Client</th>
                                    <th scope="col" className="px-6 py-3.5">Gown & Selection</th>
                                    <th scope="col" className="px-6 py-3.5">Type</th>
                                    <th scope="col" className="px-6 py-3.5">Amount</th>
                                    <th scope="col" className="px-6 py-3.5">Status</th>
                                    <th scope="col" className="px-6 py-3.5 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentSales.map((sale, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-900">
                                            #{sale.orderId}
                                        </td>
                                        <td className="px-6 py-3.5 font-medium text-slate-900">
                                            {sale.client}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="font-medium text-slate-900 line-clamp-1">
                                                {sale.gown}
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {sale.color} • Size {sale.size}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                                                {sale.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 font-serif font-bold text-slate-900">
                                            {formatCurrency(sale.amount)}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sale.statusBg}`}
                                            >
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-xs text-slate-400">
                                            {sale.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Footer Metadata ─────────────────────────────────── */}
                <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        <span>FairyLux Haute Couture Boutique • Executive Management Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span>Currency: <strong>PHP (₱)</strong></span>
                        <span>•</span>
                        <span className="text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                            Static Presentation Model
                        </span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
