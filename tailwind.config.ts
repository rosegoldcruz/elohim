/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  './pages/**/*.{js,ts,jsx,tsx,mdx}',
	  './components/**/*.{js,ts,jsx,tsx,mdx}',
	  './app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['var(--font-geist-sans)'],
		  mono: ['var(--font-geist-mono)'],
		},
		animation: {
		  'spin-slow': 'spin 3s linear infinite',
		  'bounce-slow': 'bounce 3s infinite',
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out'
		},
		backdropBlur: {
		  xs: '2px',
		}
	  },
	},
	plugins: [require("tailwindcss-animate")],
	safelist: [
	  'text-yellow-400',
	  'text-purple-400', 
	  'text-green-400',
	  'text-cyan-400',
	  'bg-yellow-500/10',
	  'bg-purple-500/10',
	  'bg-green-500/10',
	  'bg-cyan-500/10'
	]
  }