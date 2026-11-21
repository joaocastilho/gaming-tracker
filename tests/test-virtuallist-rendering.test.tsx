import { render, screen } from '@solidjs/testing-library';
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
});
