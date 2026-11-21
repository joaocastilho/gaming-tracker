import type { PageState } from '#lib/types/pageState.js';

export interface GotoOptions {
	replace?: boolean;
	shallow?: boolean;
	reset?: boolean;
	keepFocus?: boolean;
	state?: PageState;
}

export type NavigateHandler = (url: string, options?: GotoOptions) => void | Promise<void>;

let activeNavigator: NavigateHandler | null = null;
const urlChangeListeners = new Set<() => void>();

export function registerNavigator(handler: NavigateHandler | null): void {
	activeNavigator = handler;
}

export function onUrlChange(listener: () => void): () => void {
	urlChangeListeners.add(listener);
	return () => {
		urlChangeListeners.delete(listener);
	};
}

function notifyUrlChange(): void {
	for (const listener of urlChangeListeners) {
		listener();
	}
}

export async function goto(url: string, options: GotoOptions = {}): Promise<void> {
	if (activeNavigator && !options.shallow) {
		await activeNavigator(url, options);
		notifyUrlChange();
		return;
	}

	if (typeof window === 'undefined') return;

	const target = new URL(url, window.location.origin);
	const relative = `${target.pathname}${target.search}${target.hash}`;
	const nextState = options.state ?? window.history.state ?? {};

	if (options.replace) {
		window.history.replaceState(nextState, '', relative);
	} else {
		window.history.pushState(nextState, '', relative);
	}

	notifyUrlChange();
}
