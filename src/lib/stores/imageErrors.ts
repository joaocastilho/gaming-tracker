import { createSyncSignal } from './signalHelpers.js';

const MAX_FAILED_URLS = 200;

class ImageErrorStore {
	private _failedUrls = createSyncSignal<string[]>([]);

	get failedUrls(): string[] {
		return this._failedUrls.get();
	}

	set failedUrls(value: string[]) {
		this._failedUrls.set(value);
	}

	markFailed(url: string): void {
		if (!url) return;
		const current = this._failedUrls.get();
		let key = url;
		try {
			const parsed = new URL(url, window.location.origin);
			key = parsed.pathname;
		} catch {
			key = url;
		}
		if (!current.includes(key)) {
			const next = current.length >= MAX_FAILED_URLS ? [...current.slice(1), key] : [...current, key];
			this._failedUrls.set(next);
		}
	}

	hasFailed(url: string | null | undefined): boolean {
		if (!url) return false;
		const current = this._failedUrls.get();
		try {
			const parsed = new URL(url, window.location.origin);
			return current.includes(parsed.pathname);
		} catch {
			return current.includes(url);
		}
	}
}

export const imageErrorStore = new ImageErrorStore();
