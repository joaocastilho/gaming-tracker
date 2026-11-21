import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
}));

import HomePage from '../src/routes/+page.svelte';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { windowSize } from '#lib/stores/window.svelte.js';
import { createCompletedGame } from './helpers/factories';

const twelveCompletedGames = Array.from({ length: 12 }, (_, index) =>
	createCompletedGame({
		id: `completed-${index + 1}`,
		title: `Game ${index + 1}`,
		finishedDate: `2026-01-${String(index + 1).padStart(2, '0')}`,
	})
);

describe('Homepage Recent Completions two-row count', () => {
	let originalResizeObserver: typeof ResizeObserver;
	let resizeCallback: ResizeObserverCallback | null = null;

	beforeEach(() => {
		originalResizeObserver = globalThis.ResizeObserver;
		resizeCallback = null;
		globalThis.ResizeObserver = class MockResizeObserver {
			constructor(cb: ResizeObserverCallback) {
				resizeCallback = cb;
			}
			observe(): void {}
			unobserve(): void {}
			disconnect(): void {}
		};
		gamesStore.setAllGames(twelveCompletedGames);
	});

	afterEach(() => {
		globalThis.ResizeObserver = originalResizeObserver;
		windowSize.width = 1024;
	});

	function emitGridWidth(element: Element, width: number): void {
		resizeCallback?.(
			[
				{
					target: element,
					contentRect: { width } as DOMRectReadOnly,
					borderBoxSize: [],
					contentBoxSize: [],
					devicePixelContentBoxSize: [],
				},
			],
			{} as ResizeObserver
		);
	}

	it.each([
		{ viewport: 1700, expectedCols: 5, expectedCount: 10 },
		{ viewport: 1350, expectedCols: 4, expectedCount: 8 },
		{ viewport: 1050, expectedCols: 3, expectedCount: 6 },
		{ viewport: 820, expectedCols: 2, expectedCount: 4 },
		{ viewport: 400, expectedCols: 2, expectedCount: 4 },
	])(
		'shows $expectedCount cards (2 full rows of $expectedCols) at $viewport px viewport',
		({ viewport, expectedCount }) => {
			windowSize.width = viewport;
			const { container } = render(HomePage);

			expect(container.querySelectorAll('.recent-grid .game-card')).toHaveLength(expectedCount);
			expect(container.querySelector('.section-sub')?.textContent).toBe(`Last ${expectedCount} games finished`);
		}
	);

	it('tracks exact .recent-grid column breakpoints via ResizeObserver', async () => {
		windowSize.width = 1700;
		const { container } = render(HomePage);
		const grid = container.querySelector('.recent-grid')!;

		const boundaries: [number, number][] = [
			[1548, 10], // 5 * 300 + 4 * 12 = 1548 -> 5 cols
			[1547, 8], // 4 cols
			[1236, 8], // 4 * 300 + 3 * 12 = 1236 -> 4 cols
			[1235, 6], // 3 cols
			[924, 6], // 3 * 300 + 2 * 12 = 924 -> 3 cols
			[923, 4], // 2 cols
		];

		for (const [gridWidth, expectedCount] of boundaries) {
			emitGridWidth(grid, gridWidth);
			await tick();
			expect(container.querySelectorAll('.recent-grid .game-card')).toHaveLength(expectedCount);
			expect(container.querySelector('.section-sub')?.textContent).toBe(`Last ${expectedCount} games finished`);
		}
	});
});
