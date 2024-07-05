/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      animation: {
        "spin-slow-0": "spin 180s linear infinite",
        "spin-slow-1": "spin 150s linear infinite",
        "spin-slow-2": "spin 270s linear infinite",
        "spin-slow-3": "spin 360s linear infinite",
        "spin-slow-4": "spin 210s linear infinite",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
