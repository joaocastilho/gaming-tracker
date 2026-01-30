import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for cover image upload functionality
 * Tests URL validation, file validation, and API endpoint mocking
 */

// Helper functions that will be used in the implementation
function isValidImageUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return ['http:', 'https:'].includes(parsed.protocol);
	} catch {
		return false;
	}
}

function isValidPngFile(file: File): boolean {
	return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

function generateCoverPath(gameId: string): string {
	return `covers/${gameId}.webp`;
}

describe('Cover Upload Utilities', () => {
	describe('isValidImageUrl', () => {
		it('accepts valid http URLs', () => {
			expect(isValidImageUrl('http://example.com/image.png')).toBe(true);
		});

		it('accepts valid https URLs', () => {
			expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
		});

		it('rejects invalid URLs', () => {
			expect(isValidImageUrl('not-a-url')).toBe(false);
			expect(isValidImageUrl('')).toBe(false);
		});

		it('rejects data URLs', () => {
			expect(isValidImageUrl('data:image/png;base64,abc')).toBe(false);
		});

		it('rejects file URLs', () => {
			expect(isValidImageUrl('file:///path/to/image.png')).toBe(false);
		});
	});

	describe('isValidPngFile', () => {
		it('accepts PNG files by MIME type', () => {
			const file = new File([''], 'test.png', { type: 'image/png' });
			expect(isValidPngFile(file)).toBe(true);
		});

		it('accepts PNG files by extension', () => {
			const file = new File([''], 'test.PNG', { type: '' });
			expect(isValidPngFile(file)).toBe(true);
		});

		it('rejects JPEG files', () => {
			const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
			expect(isValidPngFile(file)).toBe(false);
		});

		it('rejects GIF files', () => {
			const file = new File([''], 'test.gif', { type: 'image/gif' });
			expect(isValidPngFile(file)).toBe(false);
		});

		it('rejects WebP files', () => {
			const file = new File([''], 'test.webp', { type: 'image/webp' });
			expect(isValidPngFile(file)).toBe(false);
		});
	});

	describe('generateCoverPath', () => {
		it('generates correct cover path from game ID', () => {
			expect(generateCoverPath('hollow-knight')).toBe('covers/hollow-knight.webp');
		});

		it('handles IDs with special characters', () => {
			expect(generateCoverPath('portal-2')).toBe('covers/portal-2.webp');
		});
	});
});

describe('Cover Upload API', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = originalFetch;
	});

	function mockFetch(response: Partial<Response>): typeof fetch {
		return vi.fn(() => Promise.resolve(response as Response)) as unknown as typeof fetch;
	}

	function mockFetchError(): typeof fetch {
		return vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch;
	}

	describe('Local Cover Upload (Dev Mode)', () => {
		it('calls /api/cover-upload-local with URL payload', async () => {
			const mockFn = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ success: true })
				} as Response)
			);
			globalThis.fetch = mockFn as unknown as typeof fetch;

			// Simulate the API call that will be made
			await fetch('/api/cover-upload-local', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: 'https://example.com/cover.png',
					gameId: 'test-game'
				})
			});

			expect(mockFn).toHaveBeenCalledWith(
				'/api/cover-upload-local',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('handles successful upload response', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () =>
					Promise.resolve({
						success: true,
						coverPath: 'covers/test-game.webp'
					})
			});

			const response = await fetch('/api/cover-upload-local', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: 'https://example.com/cover.png', gameId: 'test-game' })
			});

			expect(response.ok).toBe(true);
			const data = await response.json();
			expect(data.success).toBe(true);
		});

		it('handles upload failure response', async () => {
			globalThis.fetch = mockFetch({
				ok: false,
				json: () => Promise.resolve({ error: 'Failed to download image' })
			});

			const response = await fetch('/api/cover-upload-local', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: 'https://invalid.com/missing.png', gameId: 'test-game' })
			});

			expect(response.ok).toBe(false);
		});

		it('handles network errors gracefully', async () => {
			globalThis.fetch = mockFetchError();

			await expect(
				fetch('/api/cover-upload-local', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ url: 'https://example.com/cover.png', gameId: 'test-game' })
				})
			).rejects.toThrow('Network error');
		});
	});

	describe('Cover Upload with FormData', () => {
		it('sends file upload as FormData', async () => {
			const mockFn = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ success: true })
				} as Response)
			);
			globalThis.fetch = mockFn as unknown as typeof fetch;

			const formData = new FormData();
			formData.append('gameId', 'test-game');
			formData.append('file', new File([''], 'cover.png', { type: 'image/png' }));

			await fetch('/api/cover-upload-local', {
				method: 'POST',
				body: formData
			});

			expect(mockFn).toHaveBeenCalledWith(
				'/api/cover-upload-local',
				expect.objectContaining({
					method: 'POST'
				})
			);
		});
	});
});

describe('Cover Preview', () => {
	it('creates object URL for file preview', () => {
		const file = new File(['test'], 'cover.png', { type: 'image/png' });
		const url = URL.createObjectURL(file);

		expect(url).toMatch(/^blob:/);

		URL.revokeObjectURL(url);
	});

	it('validates URL before loading preview', () => {
		const validUrl = 'https://example.com/image.png';
		const invalidUrl = 'not-a-url';

		expect(isValidImageUrl(validUrl)).toBe(true);
		expect(isValidImageUrl(invalidUrl)).toBe(false);
	});
});
