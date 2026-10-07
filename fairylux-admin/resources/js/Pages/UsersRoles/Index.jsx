import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShieldCheck, Sparkles, UserCog } from 'lucide-react';

export default function UsersRolesIndex() {
    return (
        <AdminLayout title="Users & Roles">
            <Head title="Users & Roles Module - FairyLux Admin" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                        Boutique Staff & Access Roles
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage admin accounts, store managers, fitting consultants & role permissions.
                    </p>
                </div>
            </div>

            <div className="bg-slate-100 border border-slate-300 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-base">Users & Roles Module Placeholder (Phase 1)</h3>
                        <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                            Staff role permissions (RBAC) and multi-user access controls will be built in Phase 4.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">RBAC & Staff Roles Planned</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
                    Staff management, fine-grained access control (Super Admin, Manager, Stylist), and security logging scheduled for Phase 4.
                </p>
            </div>
        </AdminLayout>
    );
}
