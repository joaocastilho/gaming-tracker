/**
 * Framework-free motion preference check for components that animate with JS
 * rather than CSS. Returns false during SSR, where there is nothing to animate.
 */
export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}
