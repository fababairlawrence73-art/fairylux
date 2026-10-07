import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Receipt, Search, Eye,
    Clock, CheckCircle, Truck, XCircle, Package,
    MapPin, User, X, Star, Loader2,
} from 'lucide-react';

// ─── Status Transition Matrix (mirrors backend) ───────────────────────────────
const VALID_TRANSITIONS = {
    pending:    ['confirmed', 'cancelled'],
    confirmed:  ['processing', 'cancelled'],
    processing: ['completed', 'cancelled'],
    completed:  [],
    cancelled:  [],
    shipped:    ['delivered', 'cancelled'],
    delivered:  [],
};

// ─── Status Display Config ────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        iconClass: 'text-amber-500',
    },
    confirmed: {
        label: 'Confirmed',
        icon: CheckCircle,
        className: 'bg-sky-50 text-sky-700 border-sky-200',
        iconClass: 'text-sky-500',
    },
    processing: {
        label: 'Processing',
        icon: Package,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        iconClass: 'text-blue-500',
    },
    completed: {
        label: 'Completed',
        icon: Star,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconClass: 'text-emerald-500',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        iconClass: 'text-rose-500',
    },
    shipped: {
        label: 'Shipped',
        icon: Truck,
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        iconClass: 'text-purple-500',
    },
    delivered: {
        label: 'Delivered',
        icon: CheckCircle,
        className: 'bg-teal-50 text-teal-700 border-teal-200',
        iconClass: 'text-teal-500',
    },
};

// ─── Status display labels for dropdown ──────────────────────────────────────
const STATUS_LABELS = {
    confirmed:  'Confirmed',
    processing: 'Processing',
    completed:  'Completed',
    cancelled:  'Cancelled',
    shipped:    'Shipped',
    delivered:  'Delivered',
};

export default function OrdersIndex({ orders, filters, counts }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search: overrides.search ?? search,
            status: overrides.status ?? statusFilter,
        };
        if (!params.search) delete params.search;
        if (params.status === 'all') delete params.status;
        router.get(route('orders.index'), params, { preserveState: true, preserveScroll: true });
    }, [search, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusTab = (status) => {
        setStatusFilter(status);
        applyFilters({ status });
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        if (!newStatus) return;
        setUpdatingStatus(true);
        router.patch(route('orders.update-status', orderId), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                setUpdatingStatus(false);
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            },
            onError: () => setUpdatingStatus(false),
        });
    };

    const getStatusBadge = (status) => {
        const cfg = STATUS_CONFIG[status];
        if (!cfg) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {status}
                </span>
            );
        }
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.iconClass}`} />
                {cfg.label}
            </span>
        );
    };

    const getNextStatusOptions = (currentStatus) => {
        const transitions = VALID_TRANSITIONS[currentStatus] ?? [];
        return transitions;
    };

    const filterTabs = [
        { key: 'all',        label: 'All',        count: counts?.all },
        { key: 'pending',    label: 'Pending',    count: counts?.pending },
        { key: 'confirmed',  label: 'Confirmed',  count: counts?.confirmed },
        { key: 'processing', label: 'Processing', count: counts?.processing },
        { key: 'completed',  label: 'Completed',  count: counts?.completed },
        { key: 'cancelled',  label: 'Cancelled',  count: counts?.cancelled },
        { key: 'shipped',    label: 'Shipped',    count: counts?.shipped },
        { key: 'delivered',  label: 'Delivered',  count: counts?.delivered },
    ];

    return (
        <AdminLayout title="Orders">
            <Head title="Client Orders - FairyLux Admin" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {flash.success}
                </div>
            )}
            {flash?.errors?.status && (
                <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    {flash.errors.status}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                        Customer Orders &amp; Reservations
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time mobile boutique orders, delivery address snapshots &amp; inventory fulfillment.
                    </p>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Orders</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Receipt className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2 font-serif">{counts?.all ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">All mobile &amp; boutique orders</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 mt-2 font-serif">{counts?.pending ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">Awaiting boutique fulfillment</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Processing</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-2 font-serif">{counts?.processing ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-1">Being tailored &amp; packed</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Star className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 mt-2 font-serif">{(counts?.completed ?? 0) + (counts?.delivered ?? 0)}</p>
                    <p className="text-xs text-slate-400 mt-1">Completed &amp; delivered</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-6 p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {filterTabs.filter(t => (t.count ?? 0) > 0 || t.key === 'all' || t.key === statusFilter).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleStatusTab(tab.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    statusFilter === tab.key
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                                    statusFilter === tab.key
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-slate-200/70 text-slate-600'
                                }`}>
                                    {tab.count ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="w-full md:w-72">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Order # or Customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="py-3.5 px-4">Order #</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">Customer</th>
                                <th className="py-3.5 px-4">Delivery Address Snapshot</th>
                                <th className="py-3.5 px-4">Gown Items</th>
                                <th className="py-3.5 px-4 text-right">Total</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-medium text-amber-700">
                                            {order.order_number}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                            {order.created_at}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-medium text-slate-900">{order.customer_name}</div>
                                            <div className="text-slate-400 text-[11px]">{order.customer_email}</div>
                                            <div className="text-slate-400 text-[11px]">{order.customer_phone}</div>
                                        </td>
                                        <td className="py-3.5 px-4 max-w-xs">
                                            {order.delivery_address ? (
                                                <div className="text-slate-600">
                                                    <span className="font-semibold text-slate-800">{order.delivery_address.recipient_name}</span>
                                                    <p className="text-[11px] text-slate-500 truncate" title={order.delivery_address.formatted_address}>
                                                        {order.delivery_address.formatted_address || `${order.delivery_address.street_address}, ${order.delivery_address.city}`}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No address snapshot</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-medium text-slate-800">
                                                {order.items_count} item{order.items_count > 1 ? 's' : ''}
                                            </div>
                                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                                {order.items?.map(i => `${i.product_name} (${i.quantity})`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900 font-mono">
                                            ₱{order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm font-medium">No customer orders found</p>
                                        <p className="text-xs text-slate-400 mt-1">Orders placed via the FairyLux mobile app will appear here in real-time.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders?.links && orders.links.length > 3 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                            Showing page {orders.current_page} of {orders.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                                        link.active
                                            ? 'bg-amber-500 text-white font-medium'
                                            : link.url
                                            ? 'text-slate-600 hover:bg-slate-100'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-serif font-bold text-slate-900">
                                        Order #{selectedOrder.order_number}
                                    </h2>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Placed on {selectedOrder.created_at}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Customer & Delivery Address Snapshot */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-2 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5 text-amber-600" /> Customer Account
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">{selectedOrder.customer_name}</p>
                                    <p className="text-xs text-slate-500">{selectedOrder.customer_email}</p>
                                    <p className="text-xs text-slate-500 mt-1">Payment: <span className="font-medium text-slate-700">{selectedOrder.payment_method}</span></p>
                                </div>

                                <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100">
                                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-2 uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5 text-amber-600" /> Delivery Address Snapshot
                                    </div>
                                    {selectedOrder.delivery_address ? (
                                        <div className="text-xs text-slate-700 space-y-0.5">
                                            <p className="font-semibold text-slate-900">{selectedOrder.delivery_address.recipient_name}</p>
                                            <p className="text-slate-600">{selectedOrder.delivery_address.phone_number}</p>
                                            <p className="text-slate-600">{selectedOrder.delivery_address.formatted_address}</p>
                                            {selectedOrder.delivery_address.landmark && (
                                                <p className="text-amber-800 text-[11px] mt-1 italic">
                                                    Note: {selectedOrder.delivery_address.landmark}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No snapshot recorded</p>
                                    )}
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div>
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                                    Ordered Gowns &amp; Items ({selectedOrder.items?.length})
                                </h3>
                                <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.product_name}
                                                        className="w-12 h-14 object-cover rounded-xl border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-900">{item.product_name}</p>
                                                    <p className="text-[11px] text-slate-500">{item.variant_info}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">Qty: {item.quantity} × ₱{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                            <div className="text-right font-mono font-semibold text-xs text-slate-900">
                                                ₱{item.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals Breakdown */}
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₱{selectedOrder.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping &amp; Handling</span>
                                    <span className="font-mono">{selectedOrder.shipping_fee > 0 ? `₱${selectedOrder.shipping_fee.toFixed(2)}` : 'Complimentary'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                                    <span>Total Amount</span>
                                    <span className="font-mono text-amber-700">₱{selectedOrder.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Status Workflow Action */}
                            <div className="pt-2 border-t border-slate-100">
                                {(() => {
                                    const nextOptions = getNextStatusOptions(selectedOrder.status);
                                    const isTerminal  = nextOptions.length === 0;

                                    if (isTerminal) {
                                        return (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                                <CheckCircle className="w-4 h-4 text-slate-400" />
                                                This order is in a terminal status and cannot be changed.
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-600">Move to:</span>
                                                {nextOptions.map((status) => {
                                                    const cfg = STATUS_CONFIG[status];
                                                    const Icon = cfg?.icon ?? Package;
                                                    const isCancelAction = status === 'cancelled';
                                                    return (
                                                        <button
                                                            key={status}
                                                            disabled={updatingStatus}
                                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60 disabled:cursor-wait ${
                                                                isCancelAction
                                                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                                            }`}
                                                        >
                                                            {updatingStatus
                                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                : <Icon className="w-3.5 h-3.5" />
                                                            }
                                                            {STATUS_LABELS[status] ?? status}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setSelectedOrder(null)}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
