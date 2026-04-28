import { describe, expect, it } from 'vitest';
import { formatDate, formatShortDate, formatMobileDate, parseDate } from '$lib/utils/dateUtils';

describe('Date Utilities', () => {
	describe('parseDate', () => {
		it('parses DD/MM/YYYY format', () => {
			const timestamp = parseDate('15/05/2023');
			expect(timestamp).not.toBeNull();
			const date = new Date(timestamp!);
			expect(date.getFullYear()).toBe(2023);
			expect(date.getMonth()).toBe(4); // May
			expect(date.getDate()).toBe(15);
		});

		it('parses ISO 8601 format', () => {
			const timestamp = parseDate('2023-05-15T12:00:00.000Z');
			expect(timestamp).not.toBeNull();
			const date = new Date(timestamp!);
			expect(date.getUTCFullYear()).toBe(2023);
			expect(date.getUTCMonth()).toBe(4);
			expect(date.getUTCDate()).toBe(15);
		});

		it('returns null for invalid dates', () => {
			expect(parseDate('invalid')).toBeNull();
			expect(parseDate('')).toBeNull();
			expect(parseDate(null)).toBeNull();
		});
	});

	describe('formatDate', () => {
		it('formats ISO date to long format', () => {
			expect(formatDate('2023-05-15T00:00:00.000Z')).toBe('May 15, 2023');
		});

		it('formats DD/MM/YYYY to long format', () => {
			expect(formatDate('15/05/2023')).toBe('May 15, 2023');
		});

		it('returns Unknown for invalid input', () => {
			expect(formatDate('invalid')).toBe('Unknown');
		});
	});

	describe('formatShortDate', () => {
		it('formats ISO date to short format', () => {
			expect(formatShortDate('2023-05-15T00:00:00.000Z')).toBe('May 15, 2023');
		});

		it('formats DD/MM/YYYY to short format', () => {
			expect(formatShortDate('15/05/2023')).toBe('May 15, 2023');
		});
	});

	describe('formatMobileDate', () => {
		it('formats ISO date to DD/MM/YY format', () => {
			expect(formatMobileDate('2023-05-15T00:00:00.000Z')).toBe('15/05/23');
		});

		it('formats DD/MM/YYYY to DD/MM/YY format', () => {
			expect(formatMobileDate('15/05/2023')).toBe('15/05/23');
		});
	});
});
