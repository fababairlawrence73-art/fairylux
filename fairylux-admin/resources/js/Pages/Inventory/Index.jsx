import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Boxes,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Search,
    Filter,
    RotateCcw,
    Plus,
    Minus,
    ArrowRight,
    Eye,
    Sliders,
    History,
    Calendar,
    User,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    X,
    ChevronRight,
    Crown,
    ExternalLink,
    FileText
} from 'lucide-react';

export default function InventoryIndex({
    summary = {},
    variants = { data: [], links: [] },
    recentLogs = [],
    categories = [],
    sizes = [],
    colors = [],
    filters = {}
}) {
    const {
        total_units = 0,
        total_variants = 0,
        in_stock_variants = 0,
        low_stock_variants = 0,
        out_of_stock_variants = 0,
        threshold = 3
    } = summary;

    // Active View Tab: 'matrix' or 'logs'
    const [activeTab, setActiveTab] = useState('matrix');

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.stock_status || '');
    const [selectedColor, setSelectedColor] = useState(filters.color_id || '');
    const [selectedSize, setSelectedSize] = useState(filters.size_id || '');

    // Adjust Stock Modal State
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [adjustAction, setAdjustAction] = useState('add'); // 'add' or 'reduce'
    const [adjustQuantity, setAdjustQuantity] = useState(1);
    const [adjustReason, setAdjustReason] = useState('restock');
    const [adjustNote, setAdjustNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [adjustError, setAdjustError] = useState('');

    // History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyVariant, setHistoryVariant] = useState(null);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Filter submit handler
    const handleFilterChange = (updates = {}) => {
        const queryParams = {
            search: updates.search !== undefined ? updates.search : searchTerm,
            category_id: updates.category_id !== undefined ? updates.category_id : selectedCategory,
            stock_status: updates.stock_status !== undefined ? updates.stock_status : selectedStatus,
            color_id: updates.color_id !== undefined ? updates.color_id : selectedColor,
            size_id: updates.size_id !== undefined ? updates.size_id : selectedSize,
        };

        // Filter out empty params
        Object.keys(queryParams).forEach(
            (key) => (queryParams[key] === '' || queryParams[key] === null) && delete queryParams[key]
        );

        router.get('/inventory', queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSelectedColor('');
        setSelectedSize('');
        router.get('/inventory', {}, { preserveState: true, replace: true });
    };

    // Open Adjust Stock Modal
    const openAdjustModal = (variant) => {
        if (!variant || !variant.id) return;
        setSelectedVariant(variant);
        setAdjustAction('add');
        setAdjustQuantity(1);
        setAdjustReason('restock');
        setAdjustNote('');
        setAdjustError('');
        setAdjustModalOpen(true);
    };

    // Calculate projected new stock
    const currentStock = selectedVariant ? Number(selectedVariant.stock_quantity) : 0;
    const qtyNumber = Number(adjustQuantity) || 0;
    const projectedChange = adjustAction === 'add' ? qtyNumber : -qtyNumber;
    const projectedNewStock = currentStock + projectedChange;
    const isNegative = projectedNewStock < 0;

    // Submit Stock Adjustment
    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        if (!selectedVariant) return;

        if (qtyNumber < 1) {
            setAdjustError('Quantity must be at least 1 unit.');
            return;
        }

        if (isNegative) {
            setAdjustError(`Cannot reduce below zero. Current stock is ${currentStock} units.`);
            return;
        }

        setIsSubmitting(true);
        setAdjustError('');

        router.post(
            `/inventory/variants/${selectedVariant.id}/adjust`,
            {
                action: adjustAction,
                quantity: qtyNumber,
                reason: adjustReason,
                reference_note: adjustNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setAdjustModalOpen(false);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setAdjustError(errors.quantity || errors.general || 'Failed to adjust stock.');
                },
            }
        );
    };

    // Open Variant History Modal
    const openHistoryModal = (variant) => {
        if (!variant || !variant.id) return;
        setHistoryVariant(variant);
        setHistoryModalOpen(true);
        setHistoryLoading(true);
        setHistoryLogs([]);

        fetch(`/inventory/variants/${variant.id}/history`)
            .then((res) => res.json())
            .then((data) => {
                setHistoryLogs(data.history || []);
                setHistoryLoading(false);
            })
            .catch(() => {
                setHistoryLoading(false);
            });
    };

    const hasActiveFilters = Boolean(
        searchTerm || selectedCategory || selectedStatus || selectedColor || selectedSize
    );

    const formatCurrency = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return '₱0.00';
        return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AdminLayout title="Inventory">
            <Head title="Inventory Matrix & Stock Management | FairyLux Admin" />

            <div className="space-y-8 pb-12">
                {/* Header with Title and Mode Switcher */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-700 uppercase tracking-widest mb-1.5">
                            <Boxes className="w-4 h-4 text-brand-500" />
                            <span>Stock Control</span>
                            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-500 font-normal">Variant-Level Matrix</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            Inventory Management
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Monitor variant quantities, execute verified stock adjustments, and review audit history.
                        </p>
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('matrix')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'matrix'
                                    ? 'bg-white text-brand-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Boxes className="w-4 h-4" />
                            <span>Stock Matrix</span>
                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-700 border border-brand-200 font-mono">
                                {total_variants}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'logs'
                                    ? 'bg-white text-brand-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            <span>Audit Logs</span>
                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                                {recentLogs.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Real Dynamic Summary Statistic Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Units */}
                    <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Total Inventory Units
                                </span>
                                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                    <Boxes className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="text-3xl font-serif font-bold text-slate-900">
                                    {total_units.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Aggregated across {total_variants} active variants
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-indigo-600">
                            Central Boutique Matrix
                        </div>
                    </div>

                    {/* In Stock Variants */}
                    <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    In Stock Variants
                                </span>
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="text-3xl font-serif font-bold text-slate-900">
                                    {in_stock_variants.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                More than {threshold} units available
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-emerald-600">
                            Healthy Availability
                        </div>
                    </div>

                    {/* Low Stock Variants */}
                    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Low Stock Variants
                                </span>
                                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="text-3xl font-serif font-bold text-slate-900">
                                    {low_stock_variants.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                1 to {threshold} units remaining
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-amber-600">
                            Replenishment Recommended
                        </div>
                    </div>

                    {/* Out of Stock Variants */}
                    <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Out of Stock
                                </span>
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                                    <AlertOctagon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="text-3xl font-serif font-bold text-slate-900">
                                    {out_of_stock_variants.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Zero units currently available
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-rose-600">
                            Immediate Restock Required
                        </div>
                    </div>
                </div>

                {activeTab === 'matrix' ? (
                    <>
                        {/* Search & Working Filters */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Search input */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by gown name or variant SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilterChange({ search: searchTerm })}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange({ search: searchTerm })}
                                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                                    >
                                        Apply Search
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Filters Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Collection Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            handleFilterChange({ category_id: e.target.value });
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Status Filter */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Stock Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => {
                                            setSelectedStatus(e.target.value);
                                            handleFilterChange({ stock_status: e.target.value });
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="in_stock">In Stock (&gt; {threshold} units)</option>
                                        <option value="low_stock">Low Stock (1–{threshold} units)</option>
                                        <option value="out_of_stock">Out of Stock (0 units)</option>
                                    </select>
                                </div>

                                {/* Color Filter */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Color Silhouette
                                    </label>
                                    <select
                                        value={selectedColor}
                                        onChange={(e) => {
                                            setSelectedColor(e.target.value);
                                            handleFilterChange({ color_id: e.target.value });
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    >
                                        <option value="">All Colors</option>
                                        {colors.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Size Filter */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Gown Size
                                    </label>
                                    <select
                                        value={selectedSize}
                                        onChange={(e) => {
                                            setSelectedSize(e.target.value);
                                            handleFilterChange({ size_id: e.target.value });
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    >
                                        <option value="">All Sizes</option>
                                        {sizes.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Variant Stock Matrix Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">Gown Product</th>
                                            <th scope="col" className="px-4 py-4">Variant SKU</th>
                                            <th scope="col" className="px-4 py-4">Color</th>
                                            <th scope="col" className="px-4 py-4">Size</th>
                                            <th scope="col" className="px-4 py-4 text-center">Current Stock</th>
                                            <th scope="col" className="px-4 py-4">Stock Status</th>
                                            <th scope="col" className="px-4 py-4">Last Updated</th>
                                            <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {variants.data.length > 0 ? (
                                            variants.data.map((variant) => {
                                                const isOutOfStock = variant.stock_status === 'out_of_stock';
                                                const isLowStock = variant.stock_status === 'low_stock';
                                                const hasVariants = variant.has_variants !== false && Boolean(variant.id);
                                                const rowKey = variant.id ? `variant-${variant.id}` : `product-${variant.product_id}`;

                                                return (
                                                    <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors">
                                                        {/* Product & Category */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                    {variant.image_url ? (
                                                                        <img
                                                                            src={variant.image_url}
                                                                            alt={variant.product_name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <Crown className="w-5 h-5 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        href={`/products/${variant.product_id}`}
                                                                        className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1"
                                                                    >
                                                                        {variant.product_name}
                                                                    </Link>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                                                                            {variant.category_name}
                                                                        </span>
                                                                        {!hasVariants && (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                                                                                Unconfigured
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* SKU */}
                                                        <td className="px-4 py-4">
                                                            {hasVariants && variant.sku && variant.sku !== '—' ? (
                                                                <span className="font-mono text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                                                                    {variant.sku}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs font-mono font-medium">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Color */}
                                                        <td className="px-4 py-4">
                                                            {hasVariants && variant.color && variant.color.name && variant.color.name !== '—' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0"
                                                                        style={{ backgroundColor: variant.color.hex_code || '#CCCCCC' }}
                                                                    />
                                                                    <span className="text-xs font-medium text-slate-800">
                                                                        {variant.color.name}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs font-medium">—</span>
                                                            )}
                                                        </td>

                                                        {/* Size */}
                                                        <td className="px-4 py-4">
                                                            {hasVariants && variant.size && (variant.size.code || variant.size.name) && (variant.size.code !== '—' && variant.size.name !== '—') ? (
                                                                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                                                    {variant.size.code || variant.size.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs font-medium">—</span>
                                                            )}
                                                        </td>

                                                        {/* Stock Count */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span
                                                                className={`inline-block font-mono text-base font-bold ${
                                                                    isOutOfStock
                                                                        ? 'text-rose-600'
                                                                        : isLowStock
                                                                        ? 'text-amber-600'
                                                                        : 'text-slate-900'
                                                                }`}
                                                            >
                                                                {variant.stock_quantity}
                                                            </span>
                                                        </td>

                                                        {/* Stock Status Badge */}
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col gap-1 items-start">
                                                                {isOutOfStock ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                                        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                                                                        Out of Stock
                                                                    </span>
                                                                ) : isLowStock ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                                        Low Stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                        In Stock
                                                                    </span>
                                                                )}
                                                                {!hasVariants && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                                                                        No variants configured
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Last Updated */}
                                                        <td className="px-4 py-4 text-xs text-slate-500">
                                                            <div>{variant.last_updated}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                                {variant.last_updated_human}
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {hasVariants ? (
                                                                    <>
                                                                        {/* Adjust Stock Button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openAdjustModal(variant)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100/80 text-brand-700 font-semibold text-xs border border-brand-200 transition-colors"
                                                                            title="Adjust Stock Quantity"
                                                                        >
                                                                            <Sliders className="w-3.5 h-3.5 text-brand-600" />
                                                                            <span>Adjust</span>
                                                                        </button>

                                                                        {/* View History Button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openHistoryModal(variant)}
                                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
                                                                            title="View Stock History"
                                                                        >
                                                                            <History className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    /* Configure Variants Button linking to Product Edit */
                                                                    <Link
                                                                        href={`/products/${variant.product_id}/edit`}
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition-colors"
                                                                        title="Configure Variants for this Product"
                                                                    >
                                                                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                                                                        <span>Configure Variants</span>
                                                                    </Link>
                                                                )}

                                                                {/* View Product Details */}
                                                                <Link
                                                                    href={`/products/${variant.product_id}`}
                                                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                                                                    title="View Product Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                                                        <Boxes className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-900">No Variants Found</h3>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                                        No product variants match your selected filter criteria. Try adjusting your search query or filters.
                                                    </p>
                                                    {hasActiveFilters && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetFilters}
                                                            className="mt-3 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                                                        >
                                                            Reset All Filters
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Links */}
                            {variants.links && variants.links.length > 3 && (
                                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="text-xs text-slate-500">
                                        Showing variant stock rows
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {variants.links.map((link, idx) => {
                                            const isActive = link.active;
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                                                        isActive
                                                            ? 'bg-brand-600 text-white font-bold'
                                                            : link.url
                                                            ? 'text-slate-600 hover:bg-slate-100'
                                                            : 'text-slate-300 pointer-events-none'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Audit Log View */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-serif font-bold text-slate-900">
                                    Boutique Stock Adjustment Audit Trail
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Verified chronological logs of all stock additions, reductions, and alterations
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                                Latest {recentLogs.length} Adjustments
                            </span>
                        </div>

                        {recentLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3.5">Gown / Variant</th>
                                            <th scope="col" className="px-4 py-3.5">SKU</th>
                                            <th scope="col" className="px-4 py-3.5">Previous</th>
                                            <th scope="col" className="px-4 py-3.5">Change</th>
                                            <th scope="col" className="px-4 py-3.5">New Stock</th>
                                            <th scope="col" className="px-4 py-3.5">Reason & Note</th>
                                            <th scope="col" className="px-4 py-3.5">Updated By</th>
                                            <th scope="col" className="px-6 py-3.5 text-right">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentLogs.map((log) => {
                                            const isPositive = log.quantity_change > 0;
                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-3.5 font-medium text-slate-900">
                                                        <div>{log.product_name}</div>
                                                        <div className="text-xs text-slate-400">
                                                            {log.color} • Size {log.size}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                                                        {log.sku}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                                                        {log.old_stock}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                                                                isPositive
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            }`}
                                                        >
                                                            {isPositive ? (
                                                                <ArrowUpRight className="w-3 h-3" />
                                                            ) : (
                                                                <ArrowDownRight className="w-3 h-3" />
                                                            )}
                                                            {isPositive ? `+${log.quantity_change}` : log.quantity_change}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">
                                                        {log.new_stock}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="capitalize font-semibold text-xs text-slate-800 block">
                                                            {log.type}
                                                        </span>
                                                        {log.reference_note && (
                                                            <span className="text-[11px] text-slate-400 line-clamp-1">
                                                                {log.reference_note}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-slate-700">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>{log.admin_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right text-xs text-slate-500">
                                                        <div>{log.date}</div>
                                                        <div className="text-[10px] text-slate-400">{log.time_ago}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <h3 className="text-sm font-semibold text-slate-700">No Adjustment Logs Yet</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Stock adjustments executed through the stock matrix will record here automatically.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Adjust Stock Modal ── */}
            {adjustModalOpen && selectedVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-slate-900">
                                    Adjust Variant Stock
                                </h3>
                                <p className="text-xs text-slate-500">
                                    SKU: <span className="font-mono font-semibold">{selectedVariant.sku}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAdjustModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Selected Variant Summary Pill */}
                        <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {selectedVariant.image_url ? (
                                        <img
                                            src={selectedVariant.image_url}
                                            alt={selectedVariant.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Crown className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {selectedVariant.product_name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>Color: {selectedVariant.color?.name || '—'}</span>
                                        <span>•</span>
                                        <span>Size: {selectedVariant.size?.code || selectedVariant.size?.name || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-xs text-slate-400 uppercase tracking-wider block">Current Stock</span>
                                <span className="text-2xl font-serif font-bold text-slate-900">
                                    {currentStock}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleAdjustSubmit} className="p-5 space-y-5">
                            {/* Action Type Toggle: Add (+) or Reduce (-) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Adjustment Action
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustAction('add')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                            adjustAction === 'add'
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Plus className="w-4 h-4 text-emerald-600" />
                                        <span>Add Stock (+)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAdjustAction('reduce')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                            adjustAction === 'reduce'
                                                ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Minus className="w-4 h-4 text-rose-600" />
                                        <span>Reduce Stock (-)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Quantity & Reason */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Quantity to {adjustAction === 'add' ? 'Add' : 'Deduct'} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={adjustQuantity}
                                        onChange={(e) => setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Adjustment Reason *
                                    </label>
                                    <select
                                        value={adjustReason}
                                        onChange={(e) => setAdjustReason(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                        required
                                    >
                                        {adjustAction === 'add' ? (
                                            <>
                                                <option value="restock">Restock / New Shipment</option>
                                                <option value="return">Customer Return / Fitting</option>
                                                <option value="adjustment">Manual Correction (Count Surplus)</option>
                                                <option value="other">Other Reason</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="damaged">Damaged / Defective Gown</option>
                                                <option value="adjustment">Manual Correction (Inventory Shrinkage)</option>
                                                <option value="rental">Boutique Rental Dispatch</option>
                                                <option value="sale">Manual Studio Purchase</option>
                                                <option value="other">Other Reason</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Reference Note */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Reference Note / PO Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Paris atelier shipment #401 or Fitting Room check"
                                    value={adjustNote}
                                    onChange={(e) => setAdjustNote(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>

                            {/* Live Projection Calculator */}
                            <div
                                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                                    isNegative
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-indigo-50/60 border-indigo-200/80 text-indigo-900'
                                }`}
                            >
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                                        Stock Projection
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5 text-sm font-semibold">
                                        <span>Current: {currentStock}</span>
                                        <span>{adjustAction === 'add' ? '+' : '-'}</span>
                                        <span>{qtyNumber}</span>
                                        <span>=</span>
                                        <span className="font-bold text-base underline decoration-2">
                                            {projectedNewStock} units
                                        </span>
                                    </div>
                                </div>

                                {isNegative && (
                                    <span className="text-xs font-bold text-rose-600 bg-white px-2 py-1 rounded-md border border-rose-300">
                                        Cannot Be Negative!
                                    </span>
                                )}
                            </div>

                            {/* Error Message */}
                            {adjustError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                                    {adjustError}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdjustModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isNegative || qtyNumber < 1}
                                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Recording...' : 'Confirm Stock Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Variant History Modal ── */}
            {historyModalOpen && historyVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-slate-900">
                                    Stock Adjustment History
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Audit trail for <span className="font-mono font-semibold">{historyVariant.sku}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHistoryModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Variant Details Ribbon */}
                        <div className="px-5 py-3 bg-brand-50/50 border-b border-brand-100/60 flex items-center justify-between text-xs shrink-0">
                            <span className="font-semibold text-brand-900 truncate">
                                {historyVariant.product_name} • {historyVariant.color?.name || '—'} (Size {historyVariant.size?.code || historyVariant.size?.name || '—'})
                            </span>
                            <span className="font-bold text-brand-800 bg-brand-100/80 px-2 py-0.5 rounded-full shrink-0">
                                Current: {historyVariant.stock_quantity} in stock
                            </span>
                        </div>

                        {/* Timeline Scroll Area */}
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {historyLoading ? (
                                <div className="py-12 text-center text-slate-400 text-xs">
                                    Loading history logs...
                                </div>
                            ) : historyLogs.length > 0 ? (
                                historyLogs.map((log) => {
                                    const isPositive = log.quantity_change > 0;
                                    return (
                                        <div
                                            key={log.id}
                                            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
                                                        isPositive
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {isPositive ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ArrowDownRight className="w-3.5 h-3.5" />
                                                    )}
                                                    {isPositive ? `+${log.quantity_change}` : log.quantity_change} Units
                                                </span>

                                                <span className="text-xs text-slate-400">
                                                    {log.date}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <div className="text-slate-700">
                                                    Stock change:{' '}
                                                    <span className="font-mono font-bold text-slate-900">
                                                        {log.old_stock}
                                                    </span>{' '}
                                                    →{' '}
                                                    <span className="font-mono font-bold text-slate-900">
                                                        {log.new_stock}
                                                    </span>
                                                </div>
                                                <span className="capitalize font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60">
                                                    {log.type}
                                                </span>
                                            </div>

                                            {log.reference_note && (
                                                <div className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60">
                                                    <span className="font-semibold text-slate-600">Note: </span>
                                                    {log.reference_note}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                                                <User className="w-3 h-3" />
                                                <span>Recorded by: {log.admin_name}</span>
                                                <span>•</span>
                                                <span>{log.time_ago}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center">
                                    <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <h4 className="text-sm font-semibold text-slate-700">No Adjustment Logs</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        No stock changes have been manually recorded for this variant yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setHistoryModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 bg-slate-100 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
