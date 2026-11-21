import { render } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#lib/utils/routerBridge.js', () => ({
	goto: vi.fn(),
	getCurrentPageState: () => ({}),
}));

import { gamesStore } from '#lib/stores/games.js';
import { windowSize } from '#lib/stores/window.js';
import HomePage from '../src/pages/HomePage.js';
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
		flush();
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
			const { container } = render(() => <HomePage />);

			expect(container.querySelectorAll('.recent-grid .game-card')).toHaveLength(expectedCount);
			expect(container.querySelector('.section-sub')?.textContent).toBe(`Last ${expectedCount} games finished`);
		}
	);

	it('tracks exact .recent-grid column breakpoints via ResizeObserver', async () => {
		windowSize.width = 1700;
		const { container } = render(() => <HomePage />);
		const grid = container.querySelector('.recent-grid')!;

		const boundaries: [number, number][] = [
			[1548, 10],
			[1547, 8],
			[1236, 8],
			[1235, 6],
			[924, 6],
			[923, 4],
		];

		for (const [gridWidth, expectedCount] of boundaries) {
			emitGridWidth(grid, gridWidth);
			expect(container.querySelectorAll('.recent-grid .game-card')).toHaveLength(expectedCount);
			expect(container.querySelector('.section-sub')?.textContent).toBe(`Last ${expectedCount} games finished`);
		}
	});
});
