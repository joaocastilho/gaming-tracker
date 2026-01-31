/**
 * Flushes all pending promises by queuing a new macrotask.
 * Useful for waiting for Svelte stores or async operations to settle.
 */
export function flushPromises() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Waits for a store to reach a certain state.
 * @param store The store to subscribe to
 * @param predicate A function that returns true when the desired state is reached
 * @param timeout Max time to wait in ms
 */
export function waitForState<T>(
	store: { subscribe: (run: (value: T) => void) => () => void },
	predicate: (value: T) => boolean,
	timeout = 1000
): Promise<T> {
	return new Promise((resolve, reject) => {
		// Use a mutable object to handle the circular dependency between
		// the subscription callback and the unsubscribe function
		const sub = { unsubscribe: undefined as (() => void) | undefined };
		let isResolved = false;

		const timer = setTimeout(() => {
			if (sub.unsubscribe) sub.unsubscribe();
			reject(new Error('Timeout waiting for state'));
		}, timeout);

		const stopSubscription = store.subscribe((value) => {
			if (isResolved) return;
			if (predicate(value)) {
				isResolved = true;
				clearTimeout(timer);
				resolve(value);
				// If this calls asynchronously, sub.unsubscribe is set.
				if (sub.unsubscribe) sub.unsubscribe();
			}
		});

		sub.unsubscribe = stopSubscription;

		// If the predicate was true immediately (synchronous), unwire immediately.
		if (isResolved) {
			stopSubscription();
		}
	});
}
