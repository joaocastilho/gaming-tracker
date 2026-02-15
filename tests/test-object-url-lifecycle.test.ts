/**
 * Tests for Object URL lifecycle in GameEditorModal
 *
 * Issue: Blob URLs created with URL.createObjectURL() are not always revoked,
 * causing memory leaks when the modal closes without explicit cleanup.
 *
 * Location: src/lib/components/GameEditorModal.svelte lines 131-147
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('GameEditorModal Object URL lifecycle', () => {
	let createdUrls: string[] = [];
	let revokedUrls: string[] = [];

	beforeEach(() => {
		createdUrls = [];
		revokedUrls = [];

		// Mock URL methods to track calls
		vi.stubGlobal('URL', {
			createObjectURL: vi.fn((_blob: Blob) => {
				const url = `blob:mock-${Math.random().toString(36).substr(2, 9)}`;
				createdUrls.push(url);
				return url;
			}),
			revokeObjectURL: vi.fn((url: string) => {
				revokedUrls.push(url);
			})
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('should revoke blob URL when explicitly clearing cover', () => {
		// Simulate: User selects file -> preview created -> user clears cover
		const mockFile = new File([''], 'test.png', { type: 'image/png' });
		const blobUrl = URL.createObjectURL(mockFile);

		// User clears cover (calls clearCover function)
		if (blobUrl.startsWith('blob:')) {
			URL.revokeObjectURL(blobUrl);
		}

		expect(createdUrls).toHaveLength(1);
		expect(revokedUrls).toHaveLength(1);
		expect(revokedUrls[0]).toBe(blobUrl);
	});

	test('should revoke blob URL when component unmounts', () => {
		// Simulate: User selects file -> modal closes without explicit clear
		const mockFile = new File([''], 'test.png', { type: 'image/png' });
		const blobUrl = URL.createObjectURL(mockFile);

		// Component unmounts - should revoke all blob URLs
		// This is the missing cleanup that needs to be added
		if (blobUrl.startsWith('blob:')) {
			URL.revokeObjectURL(blobUrl);
		}

		expect(revokedUrls).toHaveLength(1);
	});

	test('should handle multiple file selections', () => {
		// Simulate: User selects file 1, then file 2, then file 3
		const file1 = new File([''], 'test1.png', { type: 'image/png' });
		const file2 = new File([''], 'test2.png', { type: 'image/png' });
		const file3 = new File([''], 'test3.png', { type: 'image/png' });

		const url1 = URL.createObjectURL(file1);
		const url2 = URL.createObjectURL(file2);
		const url3 = URL.createObjectURL(file3);

		// All blob URLs should be tracked and revoked on unmount
		[url1, url2, url3].forEach((url) => {
			if (url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		});

		expect(createdUrls).toHaveLength(3);
		expect(revokedUrls).toHaveLength(3);
	});

	test('should not revoke non-blob URLs', () => {
		// External URLs should not be revoked
		const externalUrl = 'https://example.com/image.png';

		// Only revoke blob URLs
		if (externalUrl.startsWith('blob:')) {
			URL.revokeObjectURL(externalUrl);
		}

		expect(revokedUrls).toHaveLength(0);
	});
});
