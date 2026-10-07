import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-charcoal-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <Head title="Admin Login — FairyLux" />

            {/* Subtle gold haze background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-champagne-400/8 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                {/* Brand Monogram */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-brand-600/60 bg-brand-600/10 mb-5">
                    <span className="font-serif text-2xl font-bold text-brand-400 tracking-widest">FL</span>
                </div>

                <h1 className="font-serif text-3xl font-bold tracking-[0.12em] text-white uppercase">
                    FairyLux
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-400 font-semibold mt-1.5">
                    Luxury Gown Boutique
                </p>
                <p className="text-xs text-charcoal-400 mt-3 font-medium">
                    Administration Portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
                <div className="bg-charcoal-800/70 backdrop-blur-xl border border-charcoal-700 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">

                    {/* Status Alert */}
                    {status && (
                        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Auth Error Alert */}
                    {errors.email && (
                        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-relaxed flex items-start gap-2.5">
                            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <span>{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-[11px] font-semibold text-charcoal-300 uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-charcoal-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@fairylux.com"
                                    className="block w-full pl-10 pr-4 py-3 bg-charcoal-900/60 border border-charcoal-600 rounded-xl text-sm text-white placeholder-charcoal-500 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[11px] font-semibold text-charcoal-300 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-charcoal-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••"
                                    className="block w-full pl-10 pr-11 py-3 bg-charcoal-900/60 border border-charcoal-600 rounded-xl text-sm text-white placeholder-charcoal-500 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-500 hover:text-charcoal-300 transition-colors focus:outline-none"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2 text-xs">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-charcoal-600 bg-charcoal-900 text-brand-600 focus:ring-brand-600/20"
                            />
                            <label htmlFor="remember" className="text-charcoal-400 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 focus:outline-none focus:ring-2 focus:ring-brand-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="text-white/80">Signing in...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[11px] text-charcoal-500 mt-6 tracking-wide">
                    FairyLux &copy; {new Date().getFullYear()} — Authorised Personnel Only
                </p>
            </div>
        </div>
    );
}
