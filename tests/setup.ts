import { vi } from 'vitest';
import 'fake-indexeddb/auto'; // Mock indexedDB globally
import '@testing-library/jest-dom/vitest'; // Import jest-dom matchers

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
	value: vi.fn(),
	writable: true
});

// Mock window.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Global Fetch Mock
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(''),
		blob: () => Promise.resolve(new Blob())
	})
) as unknown as typeof fetch;

// Global LocalStorage Mock
const localStorageMock = (function () {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value.toString();
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		key: vi.fn((index: number) => Object.keys(store)[index] || null),
		get length() {
			return Object.keys(store).length;
		}
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// Global SessionStorage Mock (for swipe hint tests and filter expansion state)
const sessionStorageMock = (function () {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value.toString();
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		key: vi.fn((index: number) => Object.keys(store)[index] || null),
		get length() {
			return Object.keys(store).length;
		}
	};
})();

Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock
});

// Touch Event Simulation Helpers
// These helpers create touch events for testing gesture-based interactions
export function createTouchEvent(
	type: 'touchstart' | 'touchmove' | 'touchend',
	touches: Array<{ screenX: number; screenY: number; clientX?: number; clientY?: number }>
): TouchEvent {
	const touchList = touches.map((t, i) => {
		const touch = {
			identifier: i,
			screenX: t.screenX,
			screenY: t.screenY,
			clientX: t.clientX ?? t.screenX,
			clientY: t.clientY ?? t.screenY,
			pageX: t.screenX,
			pageY: t.screenY,
			target: document.body,
			// Required Touch properties (set to defaults for testing)
			force: 1,
			radiusX: 1,
			radiusY: 1,
			rotationAngle: 0
		};
		return touch as unknown as Touch;
	});

	return new TouchEvent(type, {
		touches: type === 'touchend' ? [] : touchList,
		changedTouches: touchList,
		bubbles: true,
		cancelable: true
	});
}

// Helper to simulate a complete swipe gesture
export function simulateSwipe(
	element: Element,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	steps = 5
): void {
	const deltaX = (endX - startX) / steps;
	const deltaY = (endY - startY) / steps;

	// Touch start
	element.dispatchEvent(createTouchEvent('touchstart', [{ screenX: startX, screenY: startY }]));

	// Touch move (intermediate steps)
	for (let i = 1; i <= steps; i++) {
		element.dispatchEvent(
			createTouchEvent('touchmove', [
				{ screenX: startX + deltaX * i, screenY: startY + deltaY * i }
			])
		);
	}

	// Touch end
	element.dispatchEvent(createTouchEvent('touchend', [{ screenX: endX, screenY: endY }]));
}

// Helper to set viewport width for responsive tests
export function setViewportWidth(width: number): void {
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width
	});
	window.dispatchEvent(new Event('resize'));
}

// Helper to reset viewport to default desktop width
export function resetViewport(): void {
	setViewportWidth(1024);
}

// Global Location Mock
// JSDOM handles location, but sometimes we need to mock assign/replace
const originalLocation = window.location;
delete (window as any).location;

Object.defineProperty(window, 'location', {
	writable: true,
	configurable: true,
	value: {
		...originalLocation,
		assign: vi.fn(),
		reload: vi.fn(),
		replace: vi.fn(),
		href: 'http://localhost:3000/',
		origin: 'http://localhost:3000',
		protocol: 'http:',
		host: 'localhost:3000',
		hostname: 'localhost',
		port: '3000',
		pathname: '/',
		search: '',
		hash: ''
	}
});
