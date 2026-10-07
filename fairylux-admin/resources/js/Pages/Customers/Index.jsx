import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    User,
    UserCheck,
    UserX,
    Search,
    Filter,
    ShieldCheck,
    Smartphone,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    ShoppingBag,
    MapPin,
    ExternalLink,
    Eye,
    Copy,
    Check,
    Clock,
    AlertTriangle,
    X,
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    RefreshCw,
    Globe,
    Layers,
    Receipt,
    Sparkles
} from 'lucide-react';

export default function CustomersIndex({ customers = {}, stats = {}, filters = {}, selected_id = null }) {
    const customerList = customers.data || [];

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters.source || 'all');

    // Active Modal Customer & Tab state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'addresses'
    const [copiedUid, setCopiedUid] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    // Toggle Confirmation Modal state
    const [confirmToggleCustomer, setConfirmToggleCustomer] = useState(null);
    const [isToggling, setIsToggling] = useState(false);

    // If selected_id was passed in URL (e.g. /customers?view=3), auto-open modal
    useEffect(() => {
        if (selected_id && customerList.length > 0) {
            const found = customerList.find((c) => c.id === Number(selected_id));
            if (found) {
                setSelectedCustomer(found);
            }
        }
    }, [selected_id, customerList]);

    // Keep selectedCustomer in sync if customerList updates (e.g. after status toggle)
    useEffect(() => {
        if (selectedCustomer) {
            const updated = customerList.find((c) => c.id === selectedCustomer.id);
            if (updated) {
                setSelectedCustomer(updated);
            }
        }
    }, [customerList]);

    // Format currency helper
    const formatCurrency = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return '₱0.00';
        return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Trigger Inertia search/filter update
    const applyFilters = (newFilters) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            status: newFilters.status !== undefined ? newFilters.status : statusFilter,
            source: newFilters.source !== undefined ? newFilters.source : sourceFilter,
        };

        // Remove empty keys
        Object.keys(query).forEach((key) => {
            if (!query[key] || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get(route('customers.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleStatusFilter = (val) => {
        setStatusFilter(val);
        applyFilters({ status: val });
    };

    const handleSourceFilter = (val) => {
        setSourceFilter(val);
        applyFilters({ source: val });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setSourceFilter('all');
        router.get(route('customers.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Copy to clipboard helper
    const copyToClipboard = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'uid') {
            setCopiedUid(true);
            setTimeout(() => setCopiedUid(false), 2000);
        } else if (type === 'email') {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    // Open detail modal directly to specific tab
    const openCustomerModal = (customer, tab = 'overview') => {
        setSelectedCustomer(customer);
        setActiveTab(tab);
    };

    // Execute status toggle
    const handleToggleStatus = (customer) => {
        setIsToggling(true);
        router.patch(
            route('customers.toggle-status', customer.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmToggleCustomer(null);
                    setIsToggling(false);
                },
                onError: () => {
                    setIsToggling(false);
                },
            }
        );
    };

    // Helper for customer avatar initials
    const getInitials = (name) => {
        if (!name) return 'FL';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Status badge style helper
    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'processing':
            case 'shipped':
            case 'confirmed':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <AdminLayout title="Customers">
            <Head title="Customer Directory | FairyLux Admin" />

            <div className="space-y-6 pb-12">
                {/* ── 1. Page Header ────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-700 uppercase tracking-widest mb-1.5">
                            <Sparkles className="w-4 h-4 text-brand-500" />
                            <span>Client Relationship Management</span>
                            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-500 font-normal">Real Database Accounts</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            Customer Directory
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Real-time customer account directory, Firebase Auth links, saved delivery addresses, and lifetime order histories.
                        </p>
                    </div>

                    {/* Header Quick Stats Pill */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                            <ShieldCheck className="w-4 h-4 text-brand-600" />
                            <span>Client Isolation Active</span>
                        </div>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            <ShoppingBag className="w-4 h-4 text-brand-400" />
                            <span>View All Orders</span>
                        </Link>
                    </div>
                </div>

                {/* ── 2. Top Summary KPI Cards ──────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Customers */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                Total Customers
                            </span>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1 block">
                                {(stats.total_customers || 0).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                                Registered customer accounts
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Active Accounts */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                Active Accounts
                            </span>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 mt-1 block">
                                {(stats.active_customers || 0).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                                {stats.inactive_customers || 0} deactivated
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Firebase Mobile App Clients */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                Firebase App Users
                            </span>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 mt-1 block">
                                {(stats.firebase_customers || 0).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                                Mobile Firebase Auth profiles
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                            <Smartphone className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Total Customer Revenue */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                Total Customer Spent
                            </span>
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1 block">
                                {formatCurrency(stats.total_customer_spent || 0)}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                                Across {stats.customers_with_orders || 0} ordering clients
                            </span>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* ── 3. Filters & Search Bar ───────────────────────────────────── */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Search input */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, phone, or Firebase UID..."
                            className="w-full pl-9 pr-10 py-2 rounded-xl text-sm border-slate-200 focus:border-brand-500 focus:ring-brand-500 bg-slate-50/50"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters({ search: '' });
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Status Filter */}
                        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => handleStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                All Status
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusFilter('active')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    statusFilter === 'active'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusFilter('inactive')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    statusFilter === 'inactive'
                                        ? 'bg-white text-rose-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Deactivated
                            </button>
                        </div>

                        {/* Source Filter */}
                        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => handleSourceFilter('all')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    sourceFilter === 'all'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                All Sources
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSourceFilter('firebase')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    sourceFilter === 'firebase'
                                        ? 'bg-white text-amber-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Firebase
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSourceFilter('direct')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    sourceFilter === 'direct'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Direct
                            </button>
                        </div>

                        {/* Clear Filters Button */}
                        {(search || statusFilter !== 'all' || sourceFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── 4. Main Customer Table ────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    {customerList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/75 text-[11px] uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5">Customer Name</th>
                                        <th scope="col" className="px-6 py-3.5">Contact Details</th>
                                        <th scope="col" className="px-6 py-3.5">Account Source</th>
                                        <th scope="col" className="px-6 py-3.5 text-center">Orders</th>
                                        <th scope="col" className="px-6 py-3.5">Total Spent</th>
                                        <th scope="col" className="px-6 py-3.5">Last Order</th>
                                        <th scope="col" className="px-6 py-3.5">Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customerList.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Name & Initials */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-amber-600 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-sm">
                                                        {getInitials(customer.name)}
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openCustomerModal(customer, 'overview')}
                                                            className="font-medium text-slate-900 hover:text-brand-600 transition-colors text-left line-clamp-1 block"
                                                        >
                                                            {customer.name}
                                                        </button>
                                                        <span className="text-xs text-slate-400 block mt-0.5">
                                                            Joined {customer.created_at}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Details (Email + Phone) */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[200px]" title={customer.email}>
                                                            {customer.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{customer.phone || 'No phone saved'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Account Source */}
                                            <td className="px-6 py-4">
                                                {customer.firebase_uid ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Smartphone className="w-3 h-3 text-amber-600" />
                                                        <span>Firebase App</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                        <Globe className="w-3 h-3 text-slate-500" />
                                                        <span>Direct / Seeded</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Total Orders */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openCustomerModal(customer, 'orders')}
                                                    className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                                        customer.total_orders > 0
                                                            ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                    title="Click to view customer orders"
                                                >
                                                    {customer.total_orders}
                                                </button>
                                            </td>

                                            {/* Total Spent */}
                                            <td className="px-6 py-4 font-serif font-bold text-slate-900">
                                                {formatCurrency(customer.total_spent)}
                                            </td>

                                            {/* Last Order */}
                                            <td className="px-6 py-4">
                                                {customer.last_order ? (
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-900 block font-mono">
                                                            #{customer.last_order.order_number}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block">
                                                            {customer.last_order.date}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No orders yet</span>
                                                )}
                                            </td>

                                            {/* Account Status */}
                                            <td className="px-6 py-4">
                                                {customer.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        <span>Deactivated</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View Profile */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openCustomerModal(customer, 'overview')}
                                                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                        title="View Customer Profile"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* View Orders */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openCustomerModal(customer, 'orders')}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="View Order History"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </button>

                                                    {/* View Addresses */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openCustomerModal(customer, 'addresses')}
                                                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View Saved Delivery Addresses"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                    </button>

                                                    {/* Toggle Status (Activate / Deactivate) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmToggleCustomer(customer)}
                                                        className={`p-1.5 rounded-lg transition-colors ${
                                                            customer.is_active
                                                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                        title={customer.is_active ? 'Deactivate Customer' : 'Activate Customer'}
                                                    >
                                                        {customer.is_active ? (
                                                            <UserX className="w-4 h-4" />
                                                        ) : (
                                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">No customers found</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                {search || statusFilter !== 'all' || sourceFilter !== 'all'
                                    ? 'No customer records matched your selected search query or filters.'
                                    : 'There are currently no customer accounts recorded in the database.'}
                            </p>
                            {(search || statusFilter !== 'all' || sourceFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Reset All Filters</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {customers.total > customers.per_page && (
                        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
                            <div>
                                Showing <strong>{customers.from || 0}</strong> to <strong>{customers.to || 0}</strong> of <strong>{customers.total}</strong> customers
                            </div>
                            <div className="flex items-center gap-1">
                                {customers.links?.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            link.active
                                                ? 'bg-brand-600 text-white'
                                                : link.url
                                                ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 5. Customer Details Modal / Slide-Over Drawer ────────────── */}
                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-amber-600 text-white font-serif font-bold text-base flex items-center justify-center shadow-md shrink-0">
                                        {getInitials(selectedCustomer.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-serif font-bold text-slate-900">
                                                {selectedCustomer.name}
                                            </h2>
                                            {selectedCustomer.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                    <span>Deactivated</span>
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 block mt-0.5">
                                            Customer ID #{selectedCustomer.id} • Registered {selectedCustomer.created_at_time}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Navigation Tabs */}
                            <div className="px-6 border-b border-slate-100 flex items-center gap-6 text-sm bg-white">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                                        activeTab === 'overview'
                                            ? 'border-brand-600 text-brand-600 font-semibold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile Overview</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('orders')}
                                    className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                                        activeTab === 'orders'
                                            ? 'border-brand-600 text-brand-600 font-semibold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Orders ({selectedCustomer.orders.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('addresses')}
                                    className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                                        activeTab === 'addresses'
                                            ? 'border-brand-600 text-brand-600 font-semibold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>Addresses ({selectedCustomer.addresses.length})</span>
                                </button>
                            </div>

                            {/* Modal Content Area */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                {/* ── TAB 1: OVERVIEW ── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Financial / Order Stats Banner */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                                    Lifetime Spend
                                                </span>
                                                <span className="text-xl font-serif font-bold text-slate-900 mt-1 block">
                                                    {formatCurrency(selectedCustomer.total_spent)}
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                    Excludes cancelled orders
                                                </span>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                                    Total Orders
                                                </span>
                                                <span className="text-xl font-serif font-bold text-slate-900 mt-1 block">
                                                    {selectedCustomer.total_orders}
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                    {selectedCustomer.orders.filter(o => o.status === 'completed').length} completed
                                                </span>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                                    Average Order Value
                                                </span>
                                                <span className="text-xl font-serif font-bold text-slate-900 mt-1 block">
                                                    {selectedCustomer.total_orders > 0
                                                        ? formatCurrency(selectedCustomer.total_spent / selectedCustomer.total_orders)
                                                        : '₱0.00'}
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                    Per valid checkout
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contact & Profile Information Card */}
                                        <div className="p-5 rounded-2xl border border-slate-200/90 space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-brand-600" />
                                                <span>Contact & Authentication Details</span>
                                            </h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-slate-400 block">Full Name</span>
                                                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                                                        {selectedCustomer.name}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-slate-400 block">Email Address</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="font-semibold text-slate-800 text-sm">
                                                            {selectedCustomer.email}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(selectedCustomer.email, 'email')}
                                                            className="text-slate-400 hover:text-slate-600 p-0.5"
                                                            title="Copy email"
                                                        >
                                                            {copiedEmail ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-slate-400 block">Contact Phone Number</span>
                                                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                                                        {selectedCustomer.phone || 'No phone recorded'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-slate-400 block">Account Status</span>
                                                    <div className="mt-1">
                                                        {selectedCustomer.is_active ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                Active Account
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                                Deactivated Account
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Firebase Reference Card */}
                                        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4 text-amber-600" />
                                                    <span>Firebase Mobile Authentication Reference</span>
                                                </h3>
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                                    {selectedCustomer.account_source}
                                                </span>
                                            </div>

                                            {selectedCustomer.firebase_uid ? (
                                                <div className="space-y-2">
                                                    <span className="text-xs text-amber-800">
                                                        This customer is authenticated via the Firebase React Native mobile app pipeline.
                                                    </span>
                                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
                                                        <div className="font-mono text-slate-800 truncate mr-2 select-all">
                                                            {selectedCustomer.firebase_uid}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(selectedCustomer.firebase_uid, 'uid')}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 shrink-0 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                                                        >
                                                            {copiedUid ? (
                                                                <>
                                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                                    <span className="text-emerald-700">Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    <span>Copy UID</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-amber-800">
                                                    Direct or seeded customer profile. Not linked to an active external Firebase UID.
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions footer inside modal */}
                                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                            <div className="text-xs text-slate-500">
                                                Manage client access permissions:
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setConfirmToggleCustomer(selectedCustomer);
                                                }}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                    selectedCustomer.is_active
                                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                                }`}
                                            >
                                                {selectedCustomer.is_active ? (
                                                    <>
                                                        <UserX className="w-4 h-4" />
                                                        <span>Deactivate Customer Account</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="w-4 h-4" />
                                                        <span>Activate Customer Account</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── TAB 2: ORDERS HISTORY ── */}
                                {activeTab === 'orders' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Lifetime Orders ({selectedCustomer.orders.length})
                                            </h3>
                                            <Link
                                                href={`/orders?search=${encodeURIComponent(selectedCustomer.email)}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                                            >
                                                <span>Filter in Orders Module</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>

                                        {selectedCustomer.orders.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedCustomer.orders.map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors bg-white space-y-3"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-mono font-bold text-sm text-slate-900">
                                                                    #{order.order_number}
                                                                </span>
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getOrderStatusBadge(
                                                                        order.status
                                                                    )}`}
                                                                >
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                                <span>{order.created_at}</span>
                                                                <span>•</span>
                                                                <span className="font-serif font-bold text-sm text-slate-900">
                                                                    {formatCurrency(order.total_amount)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Items Preview */}
                                                        {order.items?.length > 0 && (
                                                            <div className="bg-slate-50/70 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100">
                                                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                                                    Ordered Items ({order.items_count}):
                                                                </span>
                                                                {order.items.map((item) => (
                                                                    <div key={item.id} className="flex items-center justify-between text-slate-700">
                                                                        <span className="font-medium">
                                                                            {item.quantity}x {item.product_name} {item.variant_info ? `(${item.variant_info})` : ''}
                                                                        </span>
                                                                        <span className="font-mono font-semibold">
                                                                            {formatCurrency(item.total_price)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                                                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <h4 className="text-xs font-semibold text-slate-800">No orders placed yet</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    This customer has registered an account but has not completed any checkouts.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAB 3: SAVED ADDRESSES ── */}
                                {activeTab === 'addresses' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Saved Delivery Addresses ({selectedCustomer.addresses.length})
                                            </h3>
                                        </div>

                                        {selectedCustomer.addresses.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedCustomer.addresses.map((addr) => (
                                                    <div
                                                        key={addr.id}
                                                        className="p-4 rounded-xl border border-slate-200 bg-white relative space-y-2 hover:shadow-sm transition-shadow"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm text-slate-900">
                                                                {addr.recipient_name}
                                                            </span>
                                                            {addr.is_default && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                                                                    <Check className="w-3 h-3 text-brand-600" />
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="text-xs text-slate-600 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <Phone className="w-3 h-3 text-slate-400" />
                                                                <span>{addr.phone_number || 'No phone'}</span>
                                                            </div>
                                                            <div className="flex items-start gap-1.5 text-slate-700">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                                                <span className="leading-relaxed">
                                                                    {addr.formatted}
                                                                </span>
                                                            </div>
                                                            {addr.landmark && (
                                                                <div className="text-[11px] text-slate-400 italic pl-5">
                                                                    Landmark: {addr.landmark}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                                                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <h4 className="text-xs font-semibold text-slate-800">No saved addresses</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Customer has not entered delivery addresses on their mobile profile.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Close Action */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/75 flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 6. Confirmation Modal for Activate / Deactivate ──────────── */}
                {confirmToggleCustomer && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        confirmToggleCustomer.is_active
                                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    }`}
                                >
                                    {confirmToggleCustomer.is_active ? (
                                        <AlertTriangle className="w-5 h-5" />
                                    ) : (
                                        <UserCheck className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {confirmToggleCustomer.is_active
                                            ? 'Deactivate Customer Account?'
                                            : 'Activate Customer Account?'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Account: <strong>{confirmToggleCustomer.name}</strong> ({confirmToggleCustomer.email})
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {confirmToggleCustomer.is_active
                                    ? 'Deactivating this customer will immediately block their mobile app authentication and prevent new checkouts. Their past orders and saved data remain safely preserved.'
                                    : 'Activating this customer will restore full mobile app access, allowing them to log in, view orders, and checkout.'}
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    disabled={isToggling}
                                    onClick={() => setConfirmToggleCustomer(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isToggling}
                                    onClick={() => handleToggleStatus(confirmToggleCustomer)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
                                        confirmToggleCustomer.is_active
                                            ? 'bg-rose-600 hover:bg-rose-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {isToggling ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : confirmToggleCustomer.is_active ? (
                                        <UserX className="w-3.5 h-3.5" />
                                    ) : (
                                        <UserCheck className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                        {isToggling
                                            ? 'Updating...'
                                            : confirmToggleCustomer.is_active
                                            ? 'Yes, Deactivate'
                                            : 'Yes, Activate'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
