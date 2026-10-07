import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft, Save, Plus, Trash2, X, ImagePlus, Upload, Crown, Sparkles, Package, Palette, Ruler,
    AlertTriangle, Check
} from 'lucide-react';

export default function ProductEdit({ product, categories, sizes, colors }) {
    const { errors, flash } = usePage().props;

    // Build existing variants with display names
    const existingVariants = (product.variants || []).map(v => ({
        id: v.id,
        size_id: v.size_id,
        color_id: v.color_id,
        size_name: v.size?.name || v.size?.code || '',
        color_name: v.color?.name || '',
        color_hex: v.color?.hex_code || '#ccc',
        sku: v.sku,
        price: v.price || product.base_price,
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
    }));

    const { data, setData, post, processing } = useForm({
        _method: 'PUT',
        name: product.name || '',
        category_id: product.category_id || '',
        sku: product.sku || '',
        base_price: product.base_price || '',
        sale_price: product.sale_price || '',
        material: product.material || '',
        occasion: product.occasion || '',
        description: product.description || '',
        short_description: product.short_description || '',
        status: product.status || 'active',
        is_featured: product.is_featured || false,
        featured_image: null,
        remove_featured_image: false,
        gallery_images: [],
        remove_gallery_images: [],
        color_images: {},
        remove_color_images: [],
        variants: existingVariants,
        removed_variant_ids: [],
    });

    const [featuredPreview, setFeaturedPreview] = useState(product.featured_image_url || null);
    const [isExistingFeatured, setIsExistingFeatured] = useState(!!product.featured_image_url);
    const [existingGallery, setExistingGallery] = useState(product.images || []);
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
    const [colorPreviews, setColorPreviews] = useState(product.color_image_urls || {});
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const handleFeaturedImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('featured_image', file);
            setData('remove_featured_image', false);
            setFeaturedPreview(URL.createObjectURL(file));
            setIsExistingFeatured(false);
        }
    };

    const removeFeaturedImage = () => {
        setData('featured_image', null);
        setData('remove_featured_image', true);
        setFeaturedPreview(null);
        setIsExistingFeatured(false);
    };

    const handleGalleryImages = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setData('gallery_images', [...(data.gallery_images || []), ...files]);
        setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeExistingGallery = (path) => {
        setExistingGallery(prev => prev.filter(p => p !== path));
        setData('remove_gallery_images', [...data.remove_gallery_images, path]);
    };

    const removeNewGallery = (index) => {
        const newFiles = [...data.gallery_images];
        newFiles.splice(index, 1);
        setData('gallery_images', newFiles);
        const newPreviews = [...newGalleryPreviews];
        newPreviews.splice(index, 1);
        setNewGalleryPreviews(newPreviews);
    };

    const toggleSize = (size) => {
        setSelectedSizes(prev =>
            prev.find(s => s.id === size.id) ? prev.filter(s => s.id !== size.id) : [...prev, size]
        );
    };

    const toggleColor = (color) => {
        setSelectedColors(prev =>
            prev.find(c => c.id === color.id) ? prev.filter(c => c.id !== color.id) : [...prev, color]
        );
    };

    const handleColorImage = (colorId, file) => {
        if (!file) return;
        setData(prev => ({
            ...prev,
            color_images: { ...prev.color_images, [colorId]: file },
            remove_color_images: prev.remove_color_images.filter(id => Number(id) !== Number(colorId)),
        }));
        setColorPreviews(prev => ({
            ...prev,
            [colorId]: URL.createObjectURL(file),
        }));
    };

    const removeColorImage = (colorId) => {
        const updated = { ...data.color_images };
        delete updated[colorId];
        setData(prev => ({
            ...prev,
            color_images: updated,
            remove_color_images: Array.from(new Set([...prev.remove_color_images, colorId])),
        }));
        setColorPreviews(prev => {
            const copy = { ...prev };
            delete copy[colorId];
            return copy;
        });
    };

    // Calculate all colors actively used in this product's variants, selections, or uploaded color images
    const activeColorIds = Array.from(new Set([
        ...data.variants.map(v => Number(v.color_id)),
        ...selectedColors.map(c => Number(c.id)),
        ...Object.keys(colorPreviews || {}).map(id => Number(id)),
    ])).filter(Boolean);
    const activeProductColors = colors.filter(c => activeColorIds.includes(c.id));

    const generateVariants = () => {
        if (selectedSizes.length === 0 || selectedColors.length === 0) return;
        const baseSku = data.sku || 'FL-XXX-000';
        const newVariants = [];
        selectedSizes.forEach(size => {
            selectedColors.forEach(color => {
                const exists = data.variants.find(v => v.size_id === size.id && v.color_id === color.id);
                if (!exists) {
                    const colorCode = color.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
                    newVariants.push({
                        id: null,
                        size_id: size.id,
                        color_id: color.id,
                        size_name: size.name,
                        color_name: color.name,
                        color_hex: color.hex_code,
                        sku: `${baseSku}-${size.code}-${colorCode}`,
                        price: data.base_price || '',
                        stock_quantity: 0,
                        is_active: true,
                    });
                }
            });
        });
        setData('variants', [...data.variants, ...newVariants]);
    };

    const updateVariant = (index, field, value) => {
        const updated = [...data.variants];
        updated[index][field] = value;
        setData('variants', updated);
    };

    const removeVariant = (index) => {
        const variant = data.variants[index];
        const updated = [...data.variants];
        updated.splice(index, 1);
        setData('variants', updated);
        if (variant.id) {
            setData('removed_variant_ids', [...data.removed_variant_ids, variant.id]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.update', product.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout title="Edit Gown">
            <Head title={`Edit ${product.name} - FairyLux Admin`} />

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={route('products.show', product.id)} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">Edit Gown</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Editing: <strong>{product.name}</strong></p>
                </div>
            </div>

            {errors.general && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* General Information */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-brand-500" /> General Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Product Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-brand-100 focus:border-brand-400`} />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Category *</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${errors.category_id ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-brand-100 focus:border-brand-400`}>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">SKU *</label>
                                    <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono ${errors.sku ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-brand-100 focus:border-brand-400`} />
                                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Base Price ($) *</label>
                                    <input type="number" step="0.01" min="0" value={data.base_price} onChange={e => setData('base_price', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${errors.base_price ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-brand-100 focus:border-brand-400`} />
                                    {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Sale Price ($)</label>
                                    <input type="number" step="0.01" min="0" value={data.sale_price} onChange={e => setData('sale_price', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-500" /> Gown Specifications
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Material / Fabric</label>
                                    <input type="text" value={data.material} onChange={e => setData('material', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Occasion / Style</label>
                                    <input type="text" value={data.occasion} onChange={e => setData('occasion', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Short Description</label>
                                    <input type="text" value={data.short_description} onChange={e => setData('short_description', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Description</label>
                                    <textarea rows="4" value={data.description} onChange={e => setData('description', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400 resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <ImagePlus className="w-5 h-5 text-brand-500" /> Product Media
                            </h2>
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Main Product Image</label>
                                {featuredPreview ? (
                                    <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-brand-300 shadow-lg group">
                                        <img src={featuredPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={removeFeaturedImage}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500 font-medium">Click to upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImage} />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Gallery Images</label>
                                <div className="flex flex-wrap gap-3">
                                    {existingGallery.map((path, i) => (
                                        <div key={`existing-${i}`} className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                            <img src={`/storage/${path}`} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingGallery(path)}
                                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {newGalleryPreviews.map((preview, i) => (
                                        <div key={`new-${i}`} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-sm group">
                                            <img src={preview} alt={`New ${i}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded">NEW</div>
                                            <button type="button" onClick={() => removeNewGallery(i)}
                                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                                        <Plus className="w-5 h-5 text-slate-400" />
                                        <span className="text-[10px] text-slate-400 mt-1">Add</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryImages} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Color-Specific Images */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-brand-500" /> Color-Specific Gown Images
                                </h2>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 w-fit">
                                    {activeProductColors.length} {activeProductColors.length === 1 ? 'Color' : 'Colors'} in Palette
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs mb-6">
                                Upload a distinct gown photo for each color choice. All variants sharing the same color (e.g. Red / S, Red / M) automatically share the same color image.
                            </p>

                            {activeProductColors.length === 0 ? (
                                <div className="text-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                                    <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 font-medium text-sm">No colors in this gown yet</p>
                                    <p className="text-slate-400 text-xs mt-1">Select colors in the Variant Matrix below to upload color-specific images.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {activeProductColors.map(color => {
                                        const preview = colorPreviews[color.id];
                                        const variantCount = data.variants.filter(v => Number(v.color_id) === Number(color.id)).length;
                                        return (
                                            <div key={color.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between group">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-sm" style={{ backgroundColor: color.hex_code }} />
                                                            <span className="font-bold text-sm text-slate-900 truncate">{color.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase shrink-0">
                                                            {color.hex_code}
                                                        </span>
                                                    </div>

                                                    {/* Color Image Preview / Upload */}
                                                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 mb-3 group-hover:border-brand-200 transition-colors">
                                                        {preview ? (
                                                            <>
                                                                <img src={preview} alt={color.name} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                                                    <label className="p-2 rounded-xl bg-white text-slate-700 hover:text-brand-600 cursor-pointer shadow-lg hover:scale-105 transition-all" title="Replace Color Image">
                                                                        <Upload className="w-4 h-4" />
                                                                        <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleColorImage(color.id, e.target.files[0])} />
                                                                    </label>
                                                                    <button type="button" onClick={() => removeColorImage(color.id)} className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-105 transition-all" title="Remove Color Image">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 hover:bg-brand-50/40 transition-colors text-center">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-2 group-hover:border-brand-300 group-hover:text-brand-600 transition-colors">
                                                                    <Upload className="w-5 h-5" />
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-700">Upload Image</span>
                                                                <span className="text-[10px] text-slate-400 mt-0.5">For {color.name} Gown</span>
                                                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleColorImage(color.id, e.target.files[0])} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                    <span className="text-slate-400 font-medium">
                                                        {variantCount > 0 ? `${variantCount} variant${variantCount > 1 ? 's' : ''}` : 'No variants'}
                                                    </span>
                                                    {preview ? (
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer">
                                                                Replace
                                                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleColorImage(color.id, e.target.files[0])} />
                                                            </label>
                                                            <span className="text-slate-300">&bull;</span>
                                                            <button type="button" onClick={() => removeColorImage(color.id)} className="text-red-500 hover:text-red-700 font-semibold">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer">
                                                            + Add Photo
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleColorImage(color.id, e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Variant Matrix */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-500" /> Variant & Stock Matrix
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <Ruler className="w-3.5 h-3.5" /> Add More Sizes
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map(size => (
                                            <button key={size.id} type="button" onClick={() => toggleSize(size)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                    selectedSizes.find(s => s.id === size.id)
                                                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                                                }`}>
                                                {size.code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <Palette className="w-3.5 h-3.5" /> Add More Colors
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(color => (
                                            <button key={color.id} type="button" onClick={() => toggleColor(color)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                    selectedColors.find(c => c.id === color.id)
                                                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                                                }`}>
                                                <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: color.hex_code }} />
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button type="button" onClick={generateVariants}
                                disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                                className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                <Plus className="w-4 h-4" /> Add New Variants
                            </button>

                            {data.variants.length > 0 && (
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Size</th>
                                                <th className="px-4 py-3">Color</th>
                                                <th className="px-3 py-3 text-center">Color Image</th>
                                                <th className="px-4 py-3">SKU</th>
                                                <th className="px-4 py-3">Price ($)</th>
                                                <th className="px-4 py-3">Stock</th>
                                                <th className="px-4 py-3 text-center">Active</th>
                                                <th className="px-4 py-3 text-center">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.variants.map((variant, i) => (
                                                <tr key={i} className="hover:bg-slate-50/60">
                                                    <td className="px-4 py-3 font-medium text-slate-700">
                                                        {variant.size_name || sizes.find(s => s.id === variant.size_id)?.code || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: variant.color_hex || colors.find(c => c.id === variant.color_id)?.hex_code || '#ccc' }} />
                                                            <span className="text-slate-600 text-xs">{variant.color_name || colors.find(c => c.id === variant.color_id)?.name || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {colorPreviews[variant.color_id] ? (
                                                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 mx-auto shadow-sm" title={`Shared image for ${variant.color_name}`}>
                                                                <img src={colorPreviews[variant.color_id]} alt={variant.color_name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-300 italic">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input type="text" value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                                                            className="w-40 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-brand-300 focus:border-brand-400" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input type="number" step="0.01" min="0" value={variant.price} onChange={e => updateVariant(i, 'price', e.target.value)}
                                                            className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-300 focus:border-brand-400" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input type="number" min="0" value={variant.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', parseInt(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-300 focus:border-brand-400" />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input type="checkbox" checked={variant.is_active} onChange={e => updateVariant(i, 'is_active', e.target.checked)}
                                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button type="button" onClick={() => removeVariant(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sticky top-24">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Publish Settings</h3>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Status</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={data.is_featured} onChange={e => setData('is_featured', e.target.checked)}
                                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-5 h-5" />
                                    <div>
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">Featured Product</span>
                                        <p className="text-xs text-slate-400">Displayed prominently in the catalog</p>
                                    </div>
                                </label>
                            </div>
                            <div className="border-t border-slate-100 pt-5 space-y-3">
                                <button type="submit" disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50">
                                    {processing ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Update Gown</>
                                    )}
                                </button>
                                <Link href={route('products.show', product.id)}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                                    Cancel
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-300">Product Summary</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span className="text-slate-400">Category</span><span className="font-semibold">{categories.find(c => c.id == data.category_id)?.name || '—'}</span></li>
                                <li className="flex justify-between"><span className="text-slate-400">Base Price</span><span className="font-semibold">{data.base_price ? `$${data.base_price}` : '—'}</span></li>
                                <li className="flex justify-between"><span className="text-slate-400">Variants</span><span className="font-semibold">{data.variants.length}</span></li>
                                <li className="flex justify-between"><span className="text-slate-400">Total Stock</span><span className="font-semibold">{data.variants.reduce((sum, v) => sum + (parseInt(v.stock_quantity) || 0), 0)}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
