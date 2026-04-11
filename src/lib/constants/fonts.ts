export const FONT_CONFIG = {
	cardTitle: '700 1rem Inter, system-ui, sans-serif',
	cardSubtitle: '500 0.75rem Inter, system-ui, sans-serif',
	badge: '500 0.75rem Inter, system-ui, sans-serif',
	modalTitle: '600 1.125rem Inter, system-ui, sans-serif',
	modalBody: '400 0.9rem Inter, system-ui, sans-serif',
} as const;

export const BREAKPOINTS = {
	tiny: 240,
	small: 320,
	medium: 420,
	tablet: 768,
	desktop: 1200,
	wide: 1600,
} as const;

export const LINE_HEIGHT = {
	tight: 1.2,
	normal: 1.35,
	relaxed: 1.5,
} as const;

export const CARD_WIDTHS = {
	tiny: 180,
	small: 200,
	medium: 240,
	large: 280,
} as const;
