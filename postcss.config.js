export default {
	plugins: {
		'@tailwindcss/postcss': {},
		autoprefixer: {
			overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead'],
			grid: true,
			flexbox: 'no-2009'
		}
	}
};
