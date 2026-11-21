import { fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VirtualListTestHelper from './mocks/VirtualListTestHelper.js';

vi.mock('#lib/stores/window.js', () => ({
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
		const { container } = render(() => (
			<VirtualListTestHelper items={testItems} itemHeight={100} containerHeight={300} overscan={2} />
		));

		const items = container.querySelectorAll('.test-item');
		expect(items.length).toBeLessThanOrEqual(7);
		expect(screen.queryByText('Item Content 0')).toBeInTheDocument();
		expect(screen.queryByText('Item Content 4')).toBeInTheDocument();
		expect(screen.queryByText('Item Content 10')).toBeNull();
	});

	it('reuses existing row DOM nodes when scrolling by one item', async () => {
		const { container } = render(() => (
			<VirtualListTestHelper items={testItems} itemHeight={100} containerHeight={300} overscan={2} />
		));

		const scrollContainer = container.querySelector('.virtual-list-container') as HTMLElement;
		const row2Before = container.querySelector('[data-key="item-2"]');
		expect(row2Before).not.toBeNull();

		scrollContainer.scrollTop = 300;
		await fireEvent.scroll(scrollContainer);
		vi.advanceTimersByTime(50);
		flush();

		const row2After = container.querySelector('[data-key="item-2"]');
		expect(row2After).not.toBeNull();
		expect(row2After).toBe(row2Before);
	});
});
