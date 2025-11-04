/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Theme-aware colors that use CSS variables
				background: 'var(--color-background)',
				surface: 'var(--color-surface)',
				border: 'var(--color-border)',
				foreground: 'var(--color-text-primary)',
				accent: 'var(--color-accent)',
				'accent-foreground': '#ffffff',
				'muted-foreground': 'var(--color-text-secondary)',

				// Dark Mode Colors
				dark: {
					bg: '#0f1419',
					surface: '#1a1f27',
					border: '#2a2f3a',
					'text-primary': '#ffffff',
					'text-secondary': '#8b92a8',
					'text-tertiary': '#6b7280'
				},
				// Light Mode Colors
				light: {
					bg: '#f8f9fa',
					surface: '#ffffff',
					border: '#e5e7eb',
					'text-primary': '#1a1a1a',
					'text-secondary': '#4b5563',
					'text-tertiary': '#6b7280'
				},
				// Custom accent color (already defined above as CSS variable)
				// Tier Colors for Game Ratings
				tier: {
					s: '#dc2626', // S - Masterpiece
					a: '#f97316', // A - Amazing
					b: '#eab308', // B - Great
					c: '#22c55e', // C - Good
					d: '#06b6d4', // D - Decent
					e: '#6b7280' // E - Bad
				},
				// Platform-specific colors for badges
				platform: {
					pc: { bg: '#1e3a5f', text: '#60a5fa' },
					ps5: { bg: '#1e293b', text: '#38bdf8' },
					xbox: { bg: '#14532d', text: '#4ade80' },
					switch: { bg: '#7c2d12', text: '#fb923c' }
				},
				// Genre-specific colors for badges
				genre: {
					action_rpg: { bg: '#2d1f3f', text: '#c084fc' },
					story_adventure: { bg: '#422006', text: '#fbbf24' },
					action_adventure: { bg: '#164e63', text: '#22d3ee' },
					puzzle: { bg: '#3f1f4d', text: '#e879f9' },
					metroidvania: { bg: '#4c1d95', text: '#a78bfa' }
				}
			},
			// Custom spacing scale as specified in design
			spacing: {
				xs: '4px',
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '20px',
				'2xl': '24px',
				'3xl': '32px',
				'4xl': '40px'
			},
			// Custom border radius values
			borderRadius: {
				card: '12px',
				badge: '4px',
				button: '6px',
				input: '8px',
				modal: '16px'
			},
			// Custom box shadows
			boxShadow: {
				card: '0 4px 20px rgba(0,0,0,0.3)',
				'card-hover': '0 8px 30px rgba(0,0,0,0.5)',
				modal: '0 20px 60px rgba(0,0,0,0.5)',
				badge: '0 2px 8px rgba(0,0,0,0.3)'
			}
		}
	},
	plugins: []
};
