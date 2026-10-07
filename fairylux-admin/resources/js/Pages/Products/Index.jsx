import React, { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ShoppingBag, Plus, Search, Filter, Crown, Sparkles, Eye, Pencil, Trash2,
    Package, Star, ChevronLeft, ChevronRight, X, AlertTriangle, Check, BarChart3
} from 'lucide-react';

export default function ProductsIndex({ products, categories, filters, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [featuredFilter, setFeaturedFilter] = useState(filters?.is_featured || '');
    const [deleteModal, setDeleteModal] = useState(null);
    const [stockModal, setStockModal] = useState(null);
    const [stockForm, setStockForm] = useState({ quantity_change: 0, type: 'adjustment', reference_note: '' });

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search: overrides.search ?? search,
            category_id: overrides.category_id ?? categoryFilter,
            status: overrides.status ?? statusFilter,
            is_featured: overrides.is_featured ?? featuredFilter,
        };
        // Remove empty values
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('products.index'), params, { preserveState: true, preserveScroll: true });
    }, [search, categoryFilter, statusFilter, featuredFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStatusFilter('');
        setFeaturedFilter('');
        router.get(route('products.index'), {}, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteModal) return;
        router.delete(route('products.destroy', deleteModal.id), {
            onSuccess: () => setDeleteModal(null),
        });
    };

    const handleStockAdjust = (e) => {
        e.preventDefault();
        if (!stockModal) return;
        router.post(route('products.adjust-stock', stockModal.id), stockForm, {
            onSuccess: () => {
                setStockModal(null);
                setStockForm({ quantity_change: 0, type: 'adjustment', reference_note: '' });
            },
        });
    };

    const getStockBadge = (totalStock) => {
        if (totalStock === 0) return { text: 'Out of Stock', cls: 'bg-red-50 text-red-700 border-red-200' };
        if (totalStock <= 5) return { text: `Low Stock (${totalStock})`, cls: 'bg-amber-50 text-amber-700 border-amber-200' };
        return { text: `${totalStock} Units`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    };

    const formatPrice = (price) => `₱${parseFloat(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;


    const hasFilters = search || categoryFilter || statusFilter || featuredFilter;

    return (
        <AdminLayout title="Products">
            <Head title="Products & Gown Management - FairyLux Admin" />

            {/* Flash messages */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {flash.success}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                        Products
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your luxury gown catalog, variants, pricing and inventory.
                    </p>
                </div>
                <Link
                    href={route('products.create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-700 hover:to-brand-800 transition-all shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Statistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Total Gowns', value: stats.total, icon: ShoppingBag, color: 'text-slate-700', bg: 'bg-slate-100' },
                    { label: 'Active', value: stats.active, icon: Check, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { label: 'Inactive', value: stats.inactive, icon: X, color: 'text-slate-500', bg: 'bg-slate-100' },
                    { label: 'Featured', value: stats.featured, icon: Star, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Out of Stock', value: stats.out_of_stock, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' },
                    { label: 'Total Units', value: stats.total_stock, icon: Package, color: 'text-brand-700', bg: 'bg-brand-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-7 h-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full lg:w-80 focus-within:bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, SKU, material..."
                            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 border-none outline-none focus:ring-0 w-full p-0"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <select
                            value={categoryFilter}
                            onChange={e => { setCategoryFilter(e.target.value); applyFilters({ category_id: e.target.value }); }}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value }); }}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={featuredFilter}
                            onChange={e => { setFeaturedFilter(e.target.value); applyFilters({ is_featured: e.target.value }); }}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
                        >
                            <option value="">All</option>
                            <option value="1">Featured Only</option>
                            <option value="0">Not Featured</option>
                        </select>

                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Product Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-y border-slate-100">
                            <tr>
                                <th className="px-4 py-3.5">Product</th>
                                <th className="px-3 py-3.5">Category</th>
                                <th className="px-3 py-3.5">Price</th>
                                <th className="px-2 py-3.5 text-center">Variants</th>
                                <th className="px-2 py-3.5 text-center">Stock</th>
                                <th className="px-2 py-3.5 text-center">Status</th>
                                <th className="px-2 py-3.5 text-center">Featured</th>
                                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No products found</p>
                                            <p className="text-slate-400 text-xs">Try adjusting your filters or create a new product</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((product) => {
                                    const stock = getStockBadge(product.total_stock);
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-champagne-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {product.featured_image_url ? (
                                                            <img src={product.featured_image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Crown className="w-5 h-5 text-brand-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-[220px] lg:max-w-xs">
                                                        <Link
                                                            href={route('products.show', product.id)}
                                                            className="font-semibold text-slate-900 hover:text-brand-600 transition-colors truncate block"
                                                            title={product.name}
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <span className="text-xs text-slate-400 font-mono">{product.sku}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                {product.category ? (
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                                        {product.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="font-semibold text-slate-800">{formatPrice(product.base_price)}</div>
                                                {product.sale_price && (
                                                    <div className="text-xs text-red-500 font-medium line-through">{formatPrice(product.sale_price)}</div>
                                                )}
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                    <Package className="w-3 h-3" />
                                                    {product.variants?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${stock.cls}`}>
                                                    {stock.text}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                    product.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                    {product.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                {product.is_featured ? (
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-400 mx-auto" />
                                                ) : (
                                                    <Star className="w-4 h-4 text-slate-200 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={route('products.show', product.id)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors shadow-sm"
                                                        title="View Product Details"
                                                        aria-label={`View ${product.name}`}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </Link>
                                                    <Link
                                                        href={route('products.edit', product.id)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors shadow-sm"
                                                        title="Edit Product"
                                                        aria-label={`Edit ${product.name}`}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModal(product)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors shadow-sm"
                                                        title="Delete Product"
                                                        aria-label={`Delete ${product.name}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
                        <p className="text-slate-500 text-xs">
                            Showing {products.from}–{products.to} of {products.total} gowns
                        </p>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, i) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`p-2 rounded-lg border text-xs ${link.url ? 'border-slate-200 hover:bg-slate-50 text-slate-600' : 'border-transparent text-slate-300 pointer-events-none'}`}
                                            preserveState
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`p-2 rounded-lg border text-xs ${link.url ? 'border-slate-200 hover:bg-slate-50 text-slate-600' : 'border-transparent text-slate-300 pointer-events-none'}`}
                                            preserveState
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                            link.active
                                                ? 'bg-brand-600 text-white border-brand-600'
                                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Delete Product</h3>
                                <p className="text-slate-500 text-sm">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-slate-700 text-sm mb-6">
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>? All variants, inventory logs, and images will be permanently removed.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setDeleteModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
