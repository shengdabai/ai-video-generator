/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that may use NativeWind `className` values.
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
