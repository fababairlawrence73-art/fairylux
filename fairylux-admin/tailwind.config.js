import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                serif: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                // FairyLux Gold — mirrors mobile colors.gold (#b45309)
                brand: {
                    50:  '#fef9ee',
                    100: '#fdf0d5',
                    200: '#faddaa',
                    300: '#f6c374',
                    400: '#f1a03b',
                    500: '#ec831a',
                    600: '#b45309',   // ← PRIMARY GOLD (matches mobile colors.gold)
                    700: '#923f0a',
                    800: '#773310',
                    900: '#622b10',
                    950: '#3a1506',
                },
                // Champagne — mirrors mobile colors.champagne (#c29d59)
                champagne: {
                    50:  '#faf8f5',
                    100: '#f3efe6',
                    200: '#e5dbca',
                    300: '#d4c2a7',
                    400: '#c29d59',   // ← CHAMPAGNE GOLD (matches mobile colors.champagne)
                    500: '#ab8860',
                    600: '#9b7352',
                    700: '#815c44',
                    800: '#6a4c3b',
                    900: '#583f33',
                },
                // Charcoal — mirrors mobile colors.primary (#0f172a)
                charcoal: {
                    50:  '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',   // ← PRIMARY DARK (matches mobile colors.primary)
                    950: '#020617',
                },
            },
        },
    },

    plugins: [forms],
};
