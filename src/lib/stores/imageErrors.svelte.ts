const MAX_FAILED_URLS = 200;

export const imageErrorStore = new (class {
	failedUrls = $state<string[]>([]);

	markFailed(url: string) {
		if (!url) return;
		try {
			const parsed = new URL(url, window.location.origin);
			const path = parsed.pathname;
			if (!this.failedUrls.includes(path)) {
				if (this.failedUrls.length >= MAX_FAILED_URLS) {
					this.failedUrls.shift();
				}
				this.failedUrls.push(path);
			}
		} catch {
			if (!this.failedUrls.includes(url)) {
				if (this.failedUrls.length >= MAX_FAILED_URLS) {
					this.failedUrls.shift();
				}
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
