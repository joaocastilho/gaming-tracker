import { vi } from 'vitest';
import 'fake-indexeddb/auto'; // Mock indexedDB globally

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
