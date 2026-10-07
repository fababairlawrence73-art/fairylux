import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft, Pencil, Trash2, Crown, Sparkles, Package, Palette, Ruler,
    AlertTriangle, Check, Layers, Clock, TrendingUp, History, Tag,
    DollarSign, Eye, Plus, Minus, X, AlertCircle
} from 'lucide-react';

export default function ProductShow({ product, recentInventory = [] }) {
    const { flash, errors } = usePage().props;

    // Gallery active image
    const allImages = [
        ...(product.featured_image_url ? [{ url: product.featured_image_url, isFeatured: true }] : []),
        ...(Array.isArray(product.images)
            ? product.images.map((img) => ({
                  url: img.startsWith('http') ? img : `/storage/${img}`,
                  isFeatured: false,
              }))
            : []),
        ...(product.color_image_urls
            ? Object.values(product.color_image_urls).map((url) => ({
                  url: url,
                  isFeatured: false,
              }))
            : []),
    ];

    const [activeImage, setActiveImage] = useState(allImages[0]?.url || null);

    // Modals
    const [deleteModal, setDeleteModal] = useState(false);
    const [adjustModal, setAdjustModal] = useState(null); // variant object
    const [adjustForm, setAdjustForm] = useState({
        quantity_change: 1,
        type: 'restock',
        reference_note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPrice = (price) =>
        `₱${parseFloat(price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;


    const getStockBadge = (stock) => {
        if (stock === 0) {
            return { label: 'Out of Stock', cls: 'bg-red-50 text-red-700 border-red-200' };
        }
        if (stock <= 5) {
            return { label: `Low Stock (${stock})`, cls: 'bg-amber-50 text-amber-700 border-amber-200' };
        }
        return { label: `${stock} in Stock`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'inactive':
                return { label: 'Inactive', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
            case 'draft':
                return { label: 'Draft', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'archived':
                return { label: 'Archived', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
            default:
                return { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };

    const getInventoryTypeBadge = (type) => {
        switch (type) {
            case 'restock':
                return { label: 'Restock', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'sale':
                return { label: 'Sale', cls: 'bg-brand-50 text-brand-700 border-brand-200' };
            case 'return':
                return { label: 'Return', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'adjustment':
                return { label: 'Audit Adjustment', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'rental':
                return { label: 'Rental Out', cls: 'bg-champagne-100 text-champagne-800 border-champagne-200' };
            case 'damaged':
                return { label: 'Damaged / Write-off', cls: 'bg-red-50 text-red-700 border-red-200' };
            default:
                return { label: type, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };

    const handleDelete = () => {
        setIsSubmitting(true);
        router.delete(route('products.destroy', product.id), {
            onFinish: () => {
                setIsSubmitting(false);
                setDeleteModal(false);
            },
        });
    };

    const openAdjustModal = (variant) => {
        setAdjustModal(variant);
        setAdjustForm({
            quantity_change: 1,
            type: 'restock',
            reference_note: '',
        });
    };

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        if (!adjustModal) return;

        setIsSubmitting(true);
        router.post(
            route('products.adjust-stock', adjustModal.id),
            {
                quantity_change: parseInt(adjustForm.quantity_change, 10),
                type: adjustForm.type,
                reference_note: adjustForm.reference_note,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustModal(null);
                    setAdjustForm({ quantity_change: 1, type: 'restock', reference_note: '' });
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const statusBadge = getStatusBadge(product.status);
    const overallStockBadge = getStockBadge(product.total_stock);

    // Calculate discount if sale price exists
    const hasDiscount =
        product.sale_price &&
        parseFloat(product.sale_price) > 0 &&
        parseFloat(product.sale_price) < parseFloat(product.base_price);
    const discountPercent = hasDiscount
        ? Math.round((1 - parseFloat(product.sale_price) / parseFloat(product.base_price)) * 100)
        : null;

    return (
        <AdminLayout title={`Product Details: ${product.name}`}>
            <Head title={`${product.name} - Gown Details - FairyLux Admin`} />

            {/* Flash Feedback */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}
            {errors?.general && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.general}</span>
                </div>
            )}

            {/* Top Navigation & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('products.index')}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 shadow-sm transition-colors"
                        title="Back to Products"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                                {product.name}
                            </h1>
                            {product.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    Featured Haute Gown
                                </span>
                            )}
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.cls}`}
                            >
                                {statusBadge.label}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs font-mono mt-1">
                            SKU: <span className="text-slate-600 font-semibold">{product.sku}</span> &bull; Collection:{' '}
                            <span className="text-brand-600 font-medium">
                                {product.category?.name || 'Uncategorized'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href={route('products.edit', product.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                        <span>Edit Gown</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDeleteModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-sm shadow-sm hover:bg-rose-100 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Main Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Left Column: Visual Gallery Showcase (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 via-champagne-50/50 to-slate-100 flex items-center justify-center relative border border-slate-100">
                            {activeImage ? (
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                                />
                            ) : (
                                <div className="text-center p-6 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-3">
                                        <Crown className="w-8 h-8 text-brand-400" />
                                    </div>
                                    <span className="font-serif text-lg font-bold text-slate-800">
                                        FairyLux Atelier
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1">
                                        No visual asset uploaded yet
                                    </span>
                                </div>
                            )}

                            {product.is_featured && (
                                <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Signature
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Reel */}
                        {allImages.length > 1 && (
                            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                            activeImage === img.url
                                                ? 'border-brand-500 ring-2 ring-brand-200'
                                                : 'border-slate-200 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`${product.name} thumb ${idx}`}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Specs Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Atelier Specifications
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs text-slate-400 block font-medium">Fabric & Material</span>
                                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                                    {product.material || 'Bespoke Satin & Tulle'}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs text-slate-400 block font-medium">Occasion</span>
                                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                                    {product.occasion || 'Haute Ceremony'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                            <span>Cataloged: {new Date(product.created_at).toLocaleDateString()}</span>
                            <span>Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing, Overview & Summary (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Pricing & Stock Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Retail Valuation
                                </span>
                                <div className="flex items-baseline gap-3 mt-1">
                                    {hasDiscount ? (
                                        <>
                                            <span className="text-3xl font-serif font-bold text-brand-700">
                                                {formatPrice(product.sale_price)}
                                            </span>
                                            <span className="text-lg font-medium text-slate-400 line-through">
                                                {formatPrice(product.base_price)}
                                            </span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                                {discountPercent}% OFF
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-serif font-bold text-slate-900">
                                            {formatPrice(product.base_price)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="sm:text-right">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                                    Inventory Availability
                                </span>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${overallStockBadge.cls}`}
                                    >
                                        <Package className="w-4 h-4" />
                                        {overallStockBadge.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Short Description */}
                        {product.short_description && (
                            <div className="mt-5">
                                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                                    &ldquo;{product.short_description}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Full Description */}
                        <div className="mt-5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Gown Narrative & Cut Description
                            </h4>
                            <div className="text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none">
                                {product.description ? (
                                    <p className="whitespace-pre-line">{product.description}</p>
                                ) : (
                                    <p className="text-slate-400 italic">No formal description provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Variant Matrix Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-brand-600" />
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    Variant Stock Matrix
                                </h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {product.variants?.length || 0} Variant Combinations
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3">Size</th>
                                        <th className="px-5 py-3">Color</th>
                                        <th className="px-4 py-3 text-center">Color Image</th>
                                        <th className="px-5 py-3">Variant SKU</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                        <th className="px-5 py-3 text-center">Stock</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(!product.variants || product.variants.length === 0) ? (
                                        <tr>
                                            <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                                                No variants configured for this gown yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        product.variants.map((v) => {
                                            const vStockBadge = getStockBadge(v.stock_quantity);
                                            const variantImg = v.image_url || product.color_image_urls?.[v.color_id];
                                            return (
                                                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                                                            <Ruler className="w-3 h-3 text-slate-500" />
                                                            {v.size?.code || v.size?.name || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-inner shrink-0"
                                                                style={{ backgroundColor: v.color?.hex_code || '#cbd5e1' }}
                                                            />
                                                            <span className="font-medium text-slate-700 text-xs">
                                                                {v.color?.name || 'Standard'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        {variantImg ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveImage(variantImg)}
                                                                className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 hover:border-brand-500 shadow-sm transition-all group/thumb relative mx-auto block"
                                                                title={`View ${v.color?.name} photo in gallery`}
                                                            >
                                                                <img
                                                                    src={variantImg}
                                                                    alt={v.color?.name || 'Color variant'}
                                                                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                                                />
                                                                <div className="absolute inset-0 bg-brand-900/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Eye className="w-3 h-3 text-white" />
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-300 italic">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                                                        {v.sku}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                                                        {v.price ? formatPrice(v.price) : formatPrice(product.base_price)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center font-bold text-slate-900">
                                                        {v.stock_quantity}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${vStockBadge.cls}`}
                                                        >
                                                            {vStockBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openAdjustModal(v)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 shadow-sm transition-all"
                                                        >
                                                            <TrendingUp className="w-3.5 h-3.5" />
                                                            <span>Adjust Stock</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Audit Trail & History */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-champagne-100 text-champagne-800 flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-slate-900 text-lg">
                                Real-Time Inventory Audit Trail
                            </h3>
                            <p className="text-slate-500 text-xs">
                                Historical stock adjustments, restocks, client sales, and boutique logs.
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400">
                        Showing last {recentInventory.length} records
                    </span>
                </div>

                {recentInventory.length === 0 ? (
                    <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 font-medium text-sm">No inventory audit transactions recorded yet.</p>
                        <p className="text-slate-400 text-xs mt-1">Stock adjustments made on variants will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3">Variant Specification</th>
                                    <th className="px-4 py-3">Transaction Type</th>
                                    <th className="px-4 py-3 text-center">Qty Change</th>
                                    <th className="px-4 py-3 text-center">New Level</th>
                                    <th className="px-4 py-3">Staff / Operator</th>
                                    <th className="px-4 py-3">Reference / Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentInventory.map((item) => {
                                    const typeBadge = getInventoryTypeBadge(item.type);
                                    const isPositive = item.quantity_change > 0;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                                                {new Date(item.created_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-bold text-slate-700">
                                                        {item.product_variant?.size?.code || '—'}
                                                    </span>
                                                    <span className="text-xs text-slate-600 font-medium">
                                                        {item.product_variant?.color?.name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadge.cls}`}
                                                >
                                                    {typeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                                        isPositive
                                                            ? 'text-emerald-700 bg-emerald-50'
                                                            : 'text-rose-700 bg-rose-50'
                                                    }`}
                                                >
                                                    {isPositive ? `+${item.quantity_change}` : item.quantity_change}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-800 text-xs font-mono">
                                                {item.new_stock_level}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                                                {item.user?.name || 'Boutique Admin'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 italic max-w-xs truncate">
                                                {item.reference_note || '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Stock Adjustment Modal */}
            {adjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    Stock Adjustment
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAdjustModal(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Gown:</span>
                                    <span className="font-semibold text-slate-800">{product.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Variant:</span>
                                    <span className="font-semibold text-slate-800">
                                        Size {adjustModal.size?.code || adjustModal.size?.name} / {adjustModal.color?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Current Stock:</span>
                                    <span className="font-bold text-brand-600 font-mono">
                                        {adjustModal.stock_quantity} Units
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Adjustment Type
                                </label>
                                <select
                                    value={adjustForm.type}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                >
                                    <option value="restock">Restock (Received units from atelier)</option>
                                    <option value="sale">Client Sale (Boutique purchase)</option>
                                    <option value="return">Client Return (Restocked gown)</option>
                                    <option value="adjustment">Audit Adjustment (Inventory sync)</option>
                                    <option value="rental">Boutique Rental (Loaned for event)</option>
                                    <option value="damaged">Damaged / Fabric Defect (Written off)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Quantity Change
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={adjustForm.quantity_change}
                                        onChange={(e) =>
                                            setAdjustForm({ ...adjustForm, quantity_change: e.target.value })
                                        }
                                        placeholder="Use negative for deductions, e.g. -1"
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500 font-mono"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Enter a positive number (e.g. 5) to add stock, or a negative number (e.g. -2) to deduct stock.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Reason or Reference Note (Optional)
                                </label>
                                <textarea
                                    value={adjustForm.reference_note}
                                    onChange={(e) =>
                                        setAdjustForm({ ...adjustForm, reference_note: e.target.value })
                                    }
                                    rows="2"
                                    placeholder="e.g. VIP bridal order #1042 or spring delivery"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAdjustModal(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting ? 'Updating...' : 'Confirm Stock Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    Delete Gown
                                </h3>
                                <p className="text-xs text-slate-400">This action is irreversible</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Are you sure you want to permanently delete{' '}
                            <strong className="text-slate-900 font-semibold">{product.name}</strong>? All
                            associated variant combinations, SKU records, and uploaded gallery images will be
                            purged from the atelier archive.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
