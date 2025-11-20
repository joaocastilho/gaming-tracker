import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
	plugins: [
		tailwindcss(),
		autoprefixer({
			overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead', 'Safari >= 9'],
			grid: true,
			flexbox: 'no-2009'
		}),
		{
			postcssPlugin: 'remove-legacy-webkit-margins',
			Declaration(decl) {
				if (decl.prop === '-webkit-margin-after' || decl.prop === '-webkit-margin-before') {
					decl.remove();
				}
			}
		}
	]
};
