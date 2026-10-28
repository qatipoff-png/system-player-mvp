import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { void: '#090a0f', panel: '#101722', neon: '#42d9ff', violet: '#8b5cf6' }, boxShadow: { glow: '0 0 24px rgba(66,217,255,.13)' }, fontFamily: { mono: ['var(--font-mono)'] } } }, plugins: [] };
export default config;
