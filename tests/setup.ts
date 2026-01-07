import { vi } from 'vitest';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
	value: vi.fn(),
	writable: true
});

// Mock window.scrollIntoView if needed (often goes with scrollTo)
Element.prototype.scrollIntoView = vi.fn();

// Mock window.matchMedia if not already present (jsdom often lacks this)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});
