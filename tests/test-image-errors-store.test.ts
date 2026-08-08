import { beforeEach, describe, expect, it } from 'vitest';
import { imageErrorStore } from '$lib/stores/imageErrors.svelte';

describe('imageErrorStore', () => {
	beforeEach(() => {
		imageErrorStore.failedUrls.length = 0;
	});

	it('starts empty', () => {
		expect(imageErrorStore.failedUrls).toHaveLength(0);
	});

	it('marks an absolute path as failed', () => {
		imageErrorStore.markFailed('/covers/game.webp');
		expect(imageErrorStore.hasFailed('/covers/game.webp')).toBe(true);
	});

	it('normalizes URLs to their pathname', () => {
		imageErrorStore.markFailed('/covers/game.webp');
		expect(imageErrorStore.hasFailed('https://example.com/covers/game.webp')).toBe(true);
	});

	it('deduplicates identical failures', () => {
		imageErrorStore.markFailed('/covers/game.webp');
		imageErrorStore.markFailed('/covers/game.webp');
		expect(imageErrorStore.failedUrls).toHaveLength(1);
	});

	it('returns false for URLs that never failed', () => {
		imageErrorStore.markFailed('/covers/game.webp');
		expect(imageErrorStore.hasFailed('/covers/other.webp')).toBe(false);
	});

	it('returns false for null/undefined input', () => {
		expect(imageErrorStore.hasFailed(null)).toBe(false);
		expect(imageErrorStore.hasFailed(undefined)).toBe(false);
	});

	it('ignores empty markFailed calls', () => {
		imageErrorStore.markFailed('');
		expect(imageErrorStore.failedUrls).toHaveLength(0);
	});

	it('stores invalid URL strings as-is', () => {
		imageErrorStore.markFailed('http://exa mple.com');
		expect(imageErrorStore.failedUrls).toContain('http://exa mple.com');
		expect(imageErrorStore.hasFailed('http://exa mple.com')).toBe(true);
	});

	it('caps the failed URL list at 200, dropping the oldest', () => {
		for (let i = 0; i < 201; i++) {
			imageErrorStore.markFailed(`failing-image-${i}`);
		}
		expect(imageErrorStore.failedUrls).toHaveLength(200);
		expect(imageErrorStore.hasFailed('failing-image-0')).toBe(false);
		expect(imageErrorStore.hasFailed('failing-image-200')).toBe(true);
	});
});
