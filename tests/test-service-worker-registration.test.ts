/**
 * Regression tests for service worker registration behaviour.
 *
 * Bug: the module registered a 'controllerchange' listener that force-reloaded
 * the page whenever a newly-installed service worker took control
 * (skipWaiting + clients.claim). Combined with cache-first HTML this caused
 * interrupted hydration on first load after deployments (dead search, missing
 * CSS, unresponsive game cards until a hard refresh).
 *
 * Fix: registration must never reload the page; updates apply on the next
 * natural load. Periodic update checks stay, gated on tab visibility.
 *
 * Uses happy-dom because its window.location allows mocking reload().
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { registerServiceWorker } from '$lib/utils/serviceWorker';

type SWEventListener = (event: Event) => void;

interface RegistrationMock {
	installing: null;
	waiting: null;
	active: { scriptURL: string };
	update: ReturnType<typeof vi.fn>;
}

function createServiceWorkerMock() {
	const listeners = new Map<string, Set<SWEventListener>>();
	const registrations: RegistrationMock[] = [];
	return {
		registrations,
		register: vi.fn(() => {
			const registration: RegistrationMock = {
				installing: null,
				waiting: null,
				active: { scriptURL: '/service-worker.js' },
				update: vi.fn(() => Promise.resolve()),
			};
			registrations.push(registration);
			return Promise.resolve(registration);
		}),
		addEventListener: vi.fn((type: string, listener: SWEventListener) => {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)!.add(listener);
		}),
		removeEventListener: vi.fn((type: string, listener: SWEventListener) => {
			listeners.get(type)?.delete(listener);
		}),
		dispatch(type: string) {
			for (const listener of listeners.get(type) ?? []) listener(new Event(type));
		},
		listenerCount(type: string) {
			return listeners.get(type)?.size ?? 0;
		},
	};
}

function setNavigatorServiceWorker(mock: ReturnType<typeof createServiceWorkerMock> | undefined) {
	Object.defineProperty(window.navigator, 'serviceWorker', {
		configurable: true,
		value: mock,
	});
	if (!mock) {
		// Simulate browsers without service worker support (property must be absent)
		Reflect.deleteProperty(window.navigator, 'serviceWorker');
	}
}

describe('registerServiceWorker', () => {
	let reloadSpy: ReturnType<typeof vi.fn>;
	let originalHidden: boolean;

	beforeEach(() => {
		vi.useFakeTimers();
		reloadSpy = vi.fn();
		Object.defineProperty(window.location, 'reload', { configurable: true, value: reloadSpy });
		originalHidden = document.hidden;
		Object.defineProperty(document, 'hidden', { configurable: true, value: false });
	});

	afterEach(() => {
		vi.useRealTimers();
		Object.defineProperty(document, 'hidden', { configurable: true, value: originalHidden });
	});

	test('registers the service worker with updateViaCache none', async () => {
		const swMock = createServiceWorkerMock();
		setNavigatorServiceWorker(swMock);

		registerServiceWorker();
		await vi.advanceTimersByTimeAsync(0);

		expect(swMock.register).toHaveBeenCalledWith('/service-worker.js', { updateViaCache: 'none' });
	});

	test('does not reload the page when a new service worker takes control', async () => {
		const swMock = createServiceWorkerMock();
		setNavigatorServiceWorker(swMock);

		registerServiceWorker();
		await vi.advanceTimersByTimeAsync(0);

		swMock.dispatch('controllerchange');
		await vi.advanceTimersByTimeAsync(0);

		expect(reloadSpy).not.toHaveBeenCalled();
	});

	test('checks for updates periodically while the tab is visible', async () => {
		const swMock = createServiceWorkerMock();
		setNavigatorServiceWorker(swMock);

		registerServiceWorker();
		await vi.advanceTimersByTimeAsync(0);

		expect(swMock.registrations).toHaveLength(1);
		const update = swMock.registrations[0]!.update;

		await vi.advanceTimersByTimeAsync(60_000);
		expect(update).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(60_000);
		expect(update).toHaveBeenCalledTimes(2);
	});

	test('does not check for updates while the tab is hidden', async () => {
		const swMock = createServiceWorkerMock();
		setNavigatorServiceWorker(swMock);

		Object.defineProperty(document, 'hidden', { configurable: true, value: true });

		registerServiceWorker();
		await vi.advanceTimersByTimeAsync(0);

		await vi.advanceTimersByTimeAsync(120_000);
		expect(swMock.registrations[0]?.update).not.toHaveBeenCalled();
	});

	test('cleanup stops update checks and detaches listeners', async () => {
		const swMock = createServiceWorkerMock();
		setNavigatorServiceWorker(swMock);

		const cleanup = registerServiceWorker();
		await vi.advanceTimersByTimeAsync(0);

		cleanup?.();

		swMock.dispatch('controllerchange');
		await vi.advanceTimersByTimeAsync(120_000);

		expect(reloadSpy).not.toHaveBeenCalled();
		expect(swMock.registrations[0]?.update).not.toHaveBeenCalled();
		expect(swMock.listenerCount('controllerchange')).toBe(0);
	});

	test('handles unsupported browsers gracefully', () => {
		setNavigatorServiceWorker(undefined);
		expect(() => registerServiceWorker()).not.toThrow();
	});
});
