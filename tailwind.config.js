import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Mercedes-Benz brand colors — remplace indigo partout
                indigo: {
                    50:  '#f0f4ff',
                    100: '#dce6ff',
                    200: '#b3c8ff',
                    300: '#7aa0ff',
                    400: '#3d6eee',
                    500: '#1a3c8f',
                    600: '#16337a',
                    700: '#112963',
                    800: '#0c1f4d',
                    900: '#08173a',
                    950: '#040d22',
                },
                primary: {
                    50:  '#f0f4ff',
                    100: '#dce6ff',
                    200: '#b3c8ff',
                    300: '#7aa0ff',
                    400: '#3d6eee',
                    500: '#1a3c8f',
                    600: '#16337a',
                    700: '#112963',
                    800: '#0c1f4d',
                    900: '#08173a',
                    950: '#040d22',
                },
            },
        },
    },

    plugins: [forms],
};
