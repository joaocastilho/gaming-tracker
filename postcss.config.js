import tailwindcss from '@tailwindcss/postcss';

export default {
	plugins: [
		tailwindcss(),
		{
			postcssPlugin: 'remove-legacy-webkit-margins',
			Declaration(decl) {
				if (decl.prop.startsWith('-webkit-margin-')) {
					decl.remove();
				}
			},
		},
		{
			postcssPlugin: 'remove-prefixed-text-size-adjust',
			Declaration(decl) {
				if (['-webkit-text-size-adjust', '-moz-text-size-adjust', '-ms-text-size-adjust'].includes(decl.prop)) {
					decl.remove();
				}
			},
		},
	],
};
