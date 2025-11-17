/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
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
			},
			backdropBlur: {
				'8px': 'blur(8px)'
			},
			// Custom screen sizes for responsive design
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px'
			}
		}
	},
	plugins: []
};
