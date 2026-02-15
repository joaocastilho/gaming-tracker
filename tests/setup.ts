import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest'; // Import jest-dom matchers

// Initialize fake-indexeddb before any code runs
import 'fake-indexeddb/auto';

// Global Fetch Mock
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(''),
		blob: () => Promise.resolve(new Blob())
	})
) as unknown as typeof fetch;

// Setup that runs before each test
beforeEach(() => {
	// Ensure window mocks are set up fresh for each test
	if (typeof window !== 'undefined') {
		// Mock window.scrollTo
		Object.defineProperty(window, 'scrollTo', {
			value: vi.fn(),
			writable: true,
			configurable: true
		});

		// Mock window.scrollIntoView
		Element.prototype.scrollIntoView = vi.fn();

		// Mock window.matchMedia
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			configurable: true,
			value: vi.fn().mockImplementation((query: string) => ({
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

		// Mock IntersectionObserver
		class MockIntersectionObserver {
			observe = vi.fn();
			disconnect = vi.fn();
			unobserve = vi.fn();
		}
		Object.defineProperty(window, 'IntersectionObserver', {
			writable: true,
			configurable: true,
			value: MockIntersectionObserver
		});

		// Mock ResizeObserver
		class MockResizeObserver {
			observe = vi.fn();
			disconnect = vi.fn();
			unobserve = vi.fn();
		}
		Object.defineProperty(window, 'ResizeObserver', {
			writable: true,
			configurable: true,
			value: MockResizeObserver
		});

		// Mock navigator
		Object.defineProperty(window, 'navigator', {
			writable: true,
			configurable: true,
			value: {
				...window.navigator,
				onLine: true,
				userAgent: 'test-user-agent',
				clipboard: {
					writeText: vi.fn(),
					readText: vi.fn()
				}
			}
		});
	}

	// Storage mocks
	const createStorageMock = () => {
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
	};

	if (typeof window !== 'undefined') {
		Object.defineProperty(window, 'localStorage', {
			value: createStorageMock(),
			writable: true,
			configurable: true
		});

		Object.defineProperty(window, 'sessionStorage', {
			value: createStorageMock(),
			writable: true,
			configurable: true
		});
	}
});

// Cleanup after each test
afterEach(() => {
	vi.clearAllMocks();
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

// Helper to mock crypto.randomUUID
if (typeof crypto !== 'undefined') {
	crypto.randomUUID = vi.fn(() => 'test-uuid-1234') as unknown as typeof crypto.randomUUID;
}
