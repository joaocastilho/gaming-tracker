import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VirtualListTestHelper from './mocks/VirtualListTestHelper.svelte';

// Mock windowSize store
vi.mock('$lib/stores/window.svelte', () => ({
	windowSize: {
		height: 400,
		width: 800,
	},
}));

describe('VirtualList Component Rendering', () => {
	const testItems = Array.from({ length: 50 }, (_, i) => ({
		id: `item-${i}`,
		text: `Item Content ${i}`,
	}));

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('should render correct subset of items based on container height and item height', () => {
		const { container } = render(VirtualListTestHelper, {
			props: {
				items: testItems,
				itemHeight: 100,
				containerHeight: 300,
				overscan: 2,
			},
		});

		// At containerHeight 300 and itemHeight 100, we expect 3 visible items.
		// With overscan 2 below, we expect 3 + 2 = 5 items rendered.
		const items = container.querySelectorAll('.test-item');
		expect(items.length).toBeLessThanOrEqual(7); // Check virtualized containment
		expect(screen.queryByText('Item Content 0')).toBeInTheDocument();
		expect(screen.queryByText('Item Content 4')).toBeInTheDocument();
		expect(screen.queryByText('Item Content 10')).toBeNull(); // Should be virtualized out
	});
});
