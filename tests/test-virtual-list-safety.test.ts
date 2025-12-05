import { describe, it, expect } from 'vitest';
import { safeKeyExtractor } from '../src/lib/utils/safeKeyExtractor';

describe('Safe Key Extractor', () => {
	it('should return the extracted key as a string', () => {
		const item = { id: 123 };
		const key = safeKeyExtractor(item, 0, (i) => i.id);
		expect(key).toBe('123');
	});

	it('should handle string keys', () => {
		const item = { id: 'abc' };
		const key = safeKeyExtractor(item, 0, (i) => i.id);
		expect(key).toBe('abc');
	});

	it('should return fallback key for null', () => {
		const item = { id: null };
		const key = safeKeyExtractor(item, 5, (i) => (i as { id: string | null }).id as string);
		expect(key).toBe('fallback-key-5');
	});

	it('should return fallback key for undefined', () => {
		const item = { id: undefined };
		const key = safeKeyExtractor(item, 10, (i) => (i as { id: string | undefined }).id as string);
		expect(key).toBe('fallback-key-10');
	});

	it('should return fallback key for empty string', () => {
		const item = { id: '' };
		const key = safeKeyExtractor(item, 2, (i) => i.id);
		expect(key).toBe('fallback-key-2');
	});

	it('should handle errors in extractor function', () => {
		const item = {};
		const key = safeKeyExtractor(item, 99, () => {
			throw new Error('Extraction failed');
		});
		expect(key).toBe('error-key-99');
	});
});
