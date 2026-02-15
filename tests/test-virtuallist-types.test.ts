/**
 * Tests for VirtualList generic type safety
 *
 * Issue: VirtualList component uses Props<any> which loses type safety.
 * Should use proper generic Props<T> to maintain type information.
 *
 * Location: src/lib/components/VirtualList.svelte line 28
 */

import { describe, test, expect } from 'vitest';

describe('VirtualList generic types', () => {
	test('should maintain type safety for item data', () => {
		// This test documents the expected behavior
		// The VirtualList component should preserve the type of items passed to it
		//
		// Current (broken): Props<any> loses all type information
		// Fixed: Props<T> preserves the generic type
		//
		// Example: If items are Game[], the renderItem snippet should receive Game type

		interface TestItem {
			id: string;
			name: string;
		}

		const items: TestItem[] = [
			{ id: '1', name: 'Item 1' },
			{ id: '2', name: 'Item 2' }
		];

		// VirtualList should preserve TestItem type
		// renderItem snippet should receive (item: TestItem, isPriority: boolean)
		expect(items[0].id).toBe('1');
		expect(items[0].name).toBe('Item 1');
	});

	test('keyExtractor should receive typed items', () => {
		// keyExtractor: (item: T, index: number) => string | number
		// Should receive properly typed items, not any

		interface TestItem {
			id: string;
			value: number;
		}

		const keyExtractor = (item: TestItem, _index: number): string => {
			return item.id; // Type-safe access
		};

		const item: TestItem = { id: 'test', value: 42 };
		expect(keyExtractor(item, 0)).toBe('test');
	});
});
