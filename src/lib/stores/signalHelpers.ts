import { type Accessor, createSignal, flush } from 'solid-js';

export interface SyncSignal<T> {
	get: Accessor<T>;
	set: (value: T) => void;
}

/**
 * Solid 2.0 signal wrapper that flushes writes synchronously so imperative
 * store callers and unit tests observe updated values immediately while
 * preserving fine-grained reactivity for memos, effects, and JSX.
 */
// biome-ignore lint/complexity/noBannedTypes: matches Solid 2.0's createSignal Exclude<T, Function> overload
export function createSyncSignal<T>(initial: Exclude<T, Function>): SyncSignal<T> {
	const [get, rawSet] = createSignal<T>(initial, { ownedWrite: true });
	return {
		get,
		set(value: T): void {
			rawSet(() => value);
			flush();
		},
	};
}
