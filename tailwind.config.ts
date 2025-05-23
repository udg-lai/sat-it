import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';
import flowbitePlugin from 'flowbite/plugin';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50:  '#f3efff',
					100: '#e5d9ff',
					200: '#c9afff',
					300: '#ae85ff',
					400: '#9c5fff',
					500: '#8a3ffc', 
					600: '#752dd4',
					700: '#5c23a7',
					800: '#451a7d',
					900: '#2e1154'
				}
			}
		}
	},

	plugins: [typography, containerQueries, flowbitePlugin]
} satisfies Config;
