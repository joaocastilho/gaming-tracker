export const imageErrorStore = new (class {
	failedUrls = $state<string[]>([]);

	markFailed(url: string) {
		if (!url) return;
		try {
			const parsed = new URL(url, window.location.origin);
			if (!this.failedUrls.includes(parsed.pathname)) {
				this.failedUrls.push(parsed.pathname);
			}
		} catch {
			if (!this.failedUrls.includes(url)) {
				this.failedUrls.push(url);
			}
		}
	}

	hasFailed(url: string | null | undefined): boolean {
		if (!url) return false;
		try {
			const parsed = new URL(url, window.location.origin);
			return this.failedUrls.includes(parsed.pathname);
		} catch {
			return this.failedUrls.includes(url);
		}
	}
})();
