import { describe, expect, it } from 'bun:test';
import { parseDate } from './dateUtils';

describe('parseDate', () => {
	it('should return null for null input', () => {
		expect(parseDate(null)).toBeNull();
	});

	it('should return null for empty string', () => {
		expect(parseDate('')).toBeNull();
	});

	it('should parse DD/MM/YYYY format correctly', () => {
		// 12th May 2023
		const timestamp = parseDate('12/05/2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(4); // May is 4
		expect(date.getDate()).toBe(12);
	});

	it('should parse DD-MM-YYYY format correctly', () => {
		// 12th May 2023
		const timestamp = parseDate('12-05-2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(4);
		expect(date.getDate()).toBe(12);
	});

	it('should parse DD MM YYYY format correctly', () => {
		// 12th May 2023
		const timestamp = parseDate('12 05 2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(4);
		expect(date.getDate()).toBe(12);
	});

	it('should prioritize DD/MM/YYYY over MM/DD/YYYY', () => {
		// 01/02/2023 should be 1st Feb, not 2nd Jan
		const timestamp = parseDate('01/02/2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(1); // Feb is 1
		expect(date.getDate()).toBe(1);
	});

	it('should parse DD Month YYYY format correctly (short month)', () => {
		// 12 Jan 2023
		const timestamp = parseDate('12 Jan 2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(0); // Jan is 0
		expect(date.getDate()).toBe(12);
	});

	it('should parse DD Month YYYY format correctly (long month)', () => {
		// 12 January 2023
		const timestamp = parseDate('12 January 2023');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(0); // Jan is 0
		expect(date.getDate()).toBe(12);
	});

	it('should parse ISO format correctly', () => {
		// 2023-05-12
		const timestamp = parseDate('2023-05-12');
		const date = new Date(timestamp!);
		expect(date.getFullYear()).toBe(2023);
		expect(date.getMonth()).toBe(4); // May is 4
		expect(date.getDate()).toBe(12);
	});

	it('should return null for invalid dates', () => {
		expect(parseDate('invalid date')).toBeNull();
		expect(parseDate('32/01/2023')).toBeNull(); // Invalid day
		expect(parseDate('01/13/2023')).toBeNull(); // Invalid month (as DD/MM)
	});

	it('should sort dates correctly with nulls last', () => {
		const games = [
			{ id: 1, finishedDate: '12/05/2023' },
			{ id: 2, finishedDate: null },
			{ id: 3, finishedDate: '01/01/2023' },
			{ id: 4, finishedDate: '' },
			{ id: 5, finishedDate: '20/05/2023' }
		];

		const sortedAsc = [...games].sort((a, b) => {
			const aTime = parseDate(a.finishedDate);
			const bTime = parseDate(b.finishedDate);

			if (aTime === null && bTime === null) return 0;
			if (aTime === null) return 1;
			if (bTime === null) return -1;

			return aTime - bTime;
		});

		// Expected: 01/01/2023, 12/05/2023, 20/05/2023, null, ''
		expect(sortedAsc[0].id).toBe(3);
		expect(sortedAsc[1].id).toBe(1);
		expect(sortedAsc[2].id).toBe(5);
		expect(sortedAsc[3].finishedDate).toBeFalsy();
		expect(sortedAsc[4].finishedDate).toBeFalsy();

		const sortedDesc = [...games].sort((a, b) => {
			const aTime = parseDate(a.finishedDate);
			const bTime = parseDate(b.finishedDate);

			if (aTime === null && bTime === null) return 0;
			if (aTime === null) return 1;
			if (bTime === null) return -1;

			return bTime - aTime;
		});

		// Expected: 20/05/2023, 12/05/2023, 01/01/2023, null, ''
		expect(sortedDesc[0].id).toBe(5);
		expect(sortedDesc[1].id).toBe(1);
		expect(sortedDesc[2].id).toBe(3);
		expect(sortedDesc[3].finishedDate).toBeFalsy();
		expect(sortedDesc[4].finishedDate).toBeFalsy();
	});
});
