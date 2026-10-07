import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FolderTree, Ruler, Palette, Plus, Pencil, Trash2, Check,
    AlertCircle, AlertTriangle, X, Search, Sparkles, Layers,
    ArrowUpDown, Tag
} from 'lucide-react';

export default function CategoriesIndex({ categories = [], sizes = [], colors = [] }) {
    const { flash, errors } = usePage().props;

    // Tabs: 'categories' | 'sizes' | 'colors'
    const [activeTab, setActiveTab] = useState('categories');
    const [search, setSearch] = useState('');

    // --- CATEGORY STATE & MODALS ---
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
        is_active: true,
        sort_order: 0,
    });

    // --- SIZE STATE & MODALS ---
    const [sizeModalOpen, setSizeModalOpen] = useState(false);
    const [editingSize, setEditingSize] = useState(null);
    const [sizeForm, setSizeForm] = useState({
        name: '',
        code: '',
        sort_order: 0,
    });

    // --- COLOR STATE & MODALS ---
    const [colorModalOpen, setColorModalOpen] = useState(false);
    const [editingColor, setEditingColor] = useState(null);
    const [colorForm, setColorForm] = useState({
        name: '',
        hex_code: '#d4af37',
    });

    // --- DELETE CONFIRMATION STATE ---
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: null, // 'category' | 'size' | 'color'
        item: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================================
    // CATEGORY HANDLERS
    // ==========================================
    const openCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            description: '',
            is_active: true,
            sort_order: categories.length + 1,
        });
        setCategoryModalOpen(true);
    };

    const openEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryForm({
            name: cat.name,
            description: cat.description || '',
            is_active: Boolean(cat.is_active),
            sort_order: cat.sort_order ?? 0,
        });
        setCategoryModalOpen(true);
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingCategory) {
            router.put(route('categories.update', editingCategory.id), categoryForm, {
                onSuccess: () => setCategoryModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('categories.store'), categoryForm, {
                onSuccess: () => setCategoryModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // ==========================================
    // SIZE HANDLERS
    // ==========================================
    const openCreateSize = () => {
        setEditingSize(null);
        setSizeForm({
            name: '',
            code: '',
            sort_order: sizes.length + 1,
        });
        setSizeModalOpen(true);
    };

    const openEditSize = (s) => {
        setEditingSize(s);
        setSizeForm({
            name: s.name,
            code: s.code,
            sort_order: s.sort_order ?? 0,
        });
        setSizeModalOpen(true);
    };

    const handleSizeSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingSize) {
            router.put(route('sizes.update', editingSize.id), sizeForm, {
                onSuccess: () => setSizeModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('sizes.store'), sizeForm, {
                onSuccess: () => setSizeModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // ==========================================
    // COLOR HANDLERS
    // ==========================================
    const openCreateColor = () => {
        setEditingColor(null);
        setColorForm({
            name: '',
            hex_code: '#C5A059',
        });
        setColorModalOpen(true);
    };

    const openEditColor = (c) => {
        setEditingColor(c);
        setColorForm({
            name: c.name,
            hex_code: c.hex_code,
        });
        setColorModalOpen(true);
    };

    const handleColorSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingColor) {
            router.put(route('colors.update', editingColor.id), colorForm, {
                onSuccess: () => setColorModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('colors.store'), colorForm, {
                onSuccess: () => setColorModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // ==========================================
    // DELETE CONFIRMATION HANDLER
    // ==========================================
    const confirmDelete = () => {
        if (!deleteModal.item || !deleteModal.type) return;
        setIsSubmitting(true);

        const { type, item } = deleteModal;
        let deleteRoute = '';

        if (type === 'category') {
            deleteRoute = route('categories.destroy', item.id);
        } else if (type === 'size') {
            deleteRoute = route('sizes.destroy', item.id);
        } else if (type === 'color') {
            deleteRoute = route('colors.destroy', item.id);
        }

        router.delete(deleteRoute, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ open: false, type: null, item: null }),
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Filter items based on search query
    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredSizes = sizes.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const filteredColors = colors.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.hex_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout title="Categories & Attributes">
            <Head title="Categories, Sizes & Colors - FairyLux Admin" />

            {/* Flash Feedback */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}
            {errors?.general && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.general}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                        Categories & Atelier Attributes
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Configure gown collections, sizing standards, and atelier color palettes.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'categories' && (
                        <button
                            type="button"
                            onClick={openCreateCategory}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-700 hover:to-brand-800 transition-all shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Category</span>
                        </button>
                    )}
                    {activeTab === 'sizes' && (
                        <button
                            type="button"
                            onClick={openCreateSize}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-700 hover:to-brand-800 transition-all shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Size</span>
                        </button>
                    )}
                    {activeTab === 'colors' && (
                        <button
                            type="button"
                            onClick={openCreateColor}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-700 hover:to-brand-800 transition-all shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Color</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs & Search Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/60">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('categories');
                            setSearch('');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'categories'
                                ? 'bg-white text-brand-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FolderTree className="w-4 h-4" />
                        <span>Categories</span>
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {categories.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('sizes');
                            setSearch('');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'sizes'
                                ? 'bg-white text-brand-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Ruler className="w-4 h-4" />
                        <span>Sizes</span>
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {sizes.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('colors');
                            setSearch('');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'colors'
                                ? 'bg-white text-brand-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Palette className="w-4 h-4" />
                        <span>Colors</span>
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {colors.length}
                        </span>
                    </button>
                </div>

                {/* Filter Search Input */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Filter ${activeTab}...`}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-brand-500"
                    />
                </div>
            </div>

            {/* TAB CONTENT: CATEGORIES */}
            {activeTab === 'categories' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Collection Category</th>
                                    <th className="px-6 py-4">Slug Identifier</th>
                                    <th className="px-6 py-4 text-center">Gowns Assigned</th>
                                    <th className="px-6 py-4 text-center">Display Order</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No categories found matching your query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0">
                                                        <FolderTree className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-900 block">
                                                            {cat.name}
                                                        </span>
                                                        <span className="text-xs text-slate-400 block max-w-sm truncate mt-0.5">
                                                            {cat.description || 'No description provided'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {cat.slug}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                                                    {cat.products_count} Gowns
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-600 font-bold">
                                                {cat.sort_order ?? 0}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                        cat.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                                >
                                                    {cat.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditCategory(cat)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                                        title="Edit Category"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                open: true,
                                                                type: 'category',
                                                                item: cat,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SIZES */}
            {activeTab === 'sizes' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Size Name</th>
                                    <th className="px-6 py-4">Size Code / Monogram</th>
                                    <th className="px-6 py-4 text-center">Variants Utilizing</th>
                                    <th className="px-6 py-4 text-center">Sort Order</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSizes.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            No sizing standards found matching your query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSizes.map((size) => (
                                        <tr key={size.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-champagne-100 text-champagne-800 flex items-center justify-center font-bold text-xs">
                                                        <Ruler className="w-4 h-4" />
                                                    </div>
                                                    <span>{size.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs border border-slate-200">
                                                    {size.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {size.variants_count ?? 0} variants
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-600 font-bold">
                                                {size.sort_order ?? 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditSize(size)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                                        title="Edit Size"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                open: true,
                                                                type: 'size',
                                                                item: size,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Size"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: COLORS */}
            {activeTab === 'colors' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Color Shade Name</th>
                                    <th className="px-6 py-4">Hex Code Swatch</th>
                                    <th className="px-6 py-4 text-center">Variants Utilizing</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredColors.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                            No colors found matching your query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredColors.map((color) => (
                                        <tr key={color.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0"
                                                        style={{ backgroundColor: color.hex_code }}
                                                    />
                                                    <span>{color.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 rounded-md bg-slate-50 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                                                        {color.hex_code}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    {color.variants_count ?? 0} variants
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditColor(color)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                                        title="Edit Color"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                open: true,
                                                                type: 'color',
                                                                item: color,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Color"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* CATEGORY MODAL (Create / Edit) */}
            {/* ========================================================= */}
            {categoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <FolderTree className="w-4 h-4" />
                                </div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    {editingCategory ? 'Edit Gown Category' : 'Create Gown Category'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCategoryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g. Royal Bridal, Evening Wear"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                    required
                                />
                                {errors?.name && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, description: e.target.value })
                                    }
                                    rows="3"
                                    placeholder="Brief narrative for catalog display and search classification"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={categoryForm.sort_order}
                                        onChange={(e) =>
                                            setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value, 10) || 0 })
                                        }
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Publication Status
                                    </label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="cat_is_active"
                                            checked={categoryForm.is_active}
                                            onChange={(e) =>
                                                setCategoryForm({ ...categoryForm, is_active: e.target.checked })
                                            }
                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                                        />
                                        <label htmlFor="cat_is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
                                            Active in Boutique
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCategoryModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingCategory
                                        ? 'Update Category'
                                        : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* SIZE MODAL (Create / Edit) */}
            {/* ========================================================= */}
            {sizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-champagne-100 text-champagne-800 flex items-center justify-center">
                                    <Ruler className="w-4 h-4" />
                                </div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    {editingSize ? 'Edit Size Standard' : 'Add Sizing Standard'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSizeModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSizeSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Size Name *
                                </label>
                                <input
                                    type="text"
                                    value={sizeForm.name}
                                    onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                                    placeholder="e.g. Extra Small, Petite 4, Made-to-Measure"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                    required
                                />
                                {errors?.name && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Size Code / Monogram *
                                </label>
                                <input
                                    type="text"
                                    value={sizeForm.code}
                                    onChange={(e) => setSizeForm({ ...sizeForm, code: e.target.value })}
                                    placeholder="e.g. XS, S, M, L, XL, CUS"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500 font-mono uppercase"
                                    required
                                />
                                {errors?.code && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.code}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Display Sort Order
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={sizeForm.sort_order}
                                    onChange={(e) =>
                                        setSizeForm({ ...sizeForm, sort_order: parseInt(e.target.value, 10) || 0 })
                                    }
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSizeModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingSize
                                        ? 'Update Size'
                                        : 'Create Size'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* COLOR MODAL (Create / Edit) */}
            {/* ========================================================= */}
            {colorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-champagne-100 text-champagne-800 flex items-center justify-center">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg">
                                    {editingColor ? 'Edit Atelier Color' : 'Add Atelier Color'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setColorModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleColorSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Color Shade Name *
                                </label>
                                <input
                                    type="text"
                                    value={colorForm.name}
                                    onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                                    placeholder="e.g. Champagne Rose, Midnight Navy, Ivory Pearl"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                    required
                                />
                                {errors?.name && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Color Hex Code *
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={colorForm.hex_code}
                                        onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                                        className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 p-1 bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={colorForm.hex_code}
                                        onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                                        placeholder="#d4af37"
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500 font-mono uppercase"
                                        required
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Must be a valid 6-character hex code starting with # (e.g. #D4AF37).
                                </p>
                                {errors?.hex_code && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.hex_code}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setColorModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingColor
                                        ? 'Update Color'
                                        : 'Create Color'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================= */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-slate-900 text-lg capitalize">
                                    Delete {deleteModal.type}
                                </h3>
                                <p className="text-xs text-slate-400">Irreversible catalogue change</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Are you sure you want to permanently delete{' '}
                            <strong className="text-slate-900 font-semibold">
                                {deleteModal.item?.name}
                            </strong>
                            ?
                            {deleteModal.type === 'category' && (
                                <span className="block mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                    Note: Categories with active gown listings cannot be deleted until those gowns are
                                    reassigned or archived.
                                </span>
                            )}
                            {(deleteModal.type === 'size' || deleteModal.type === 'color') && (
                                <span className="block mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                    Note: Attributes actively referenced by gown variants cannot be deleted.
                                </span>
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ open: false, type: null, item: null })}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={confirmDelete}
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
