import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameCard from '$lib/components/GameCard.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import type { Game } from '$lib/types/game';

// Use hoisted state for editor mode to allow changing it in tests
const mocks = vi.hoisted(() => ({
	editorMode: false
}));

// Mock stores
vi.mock('$lib/stores/modal.svelte', () => ({
	modalStore: {
		openViewModal: vi.fn()
	}
}));

vi.mock('$lib/stores/filters.svelte', () => ({
	filtersStore: {
		togglePlatform: vi.fn(),
		toggleGenre: vi.fn(),
		toggleTier: vi.fn(),
		toggleCoOp: vi.fn(),
		subscribe: vi.fn()
	}
}));

vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		get editorMode() {
			return mocks.editorMode;
		}
	}
}));

vi.mock('$lib/stores/offline.svelte', () => ({
	offlineStore: {
		get isOnline() {
			return true;
		}
	}
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => ({ html: '<i>Icon</i>' });
	return {
		Award: MockIcon,
		Presentation: MockIcon,
		NotebookPen: MockIcon,
		Gamepad2: MockIcon,
		Timer: MockIcon,
		CalendarDays: MockIcon,
		Users: MockIcon,
		Pencil: MockIcon,
		Trash2: MockIcon
	};
});

// Mock Canvas for text measurement
const mockContext = {
	measureText: vi.fn(() => ({ width: 50 })),
	font: ''
};
const mockCanvas = {
	getContext: vi.fn(() => mockContext)
};

// Mock utils
vi.mock('../utils/imageSrcset.js', () => ({
	generateSrcset: () => 'srcset',
	generateTinySrcset: () => 'tiny-srcset',
	generateSizes: () => 'sizes'
}));

describe('GameCard Component', () => {
	const mockGame: Game = {
		id: '1',
		title: 'Test Game',
		mainTitle: 'Test Game',
		platform: 'PC',
		genre: 'RPG',
		year: 2023,
		status: 'Completed',
		score: 10,
		ratingPresentation: 10,
		ratingStory: 10,
		ratingGameplay: 10,
		playtime: '10h',
		finishedDate: '2023-01-01',
		tier: 'S - Masterpiece',
		coverImage: 'cover.webp',
		subtitle: 'Subtitle',
		coOp: 'No'
	};

	const mockDisplayedGames = [mockGame];

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.editorMode = false;

		// Mock ResizeObserver
		global.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};

		// Capture original createElement to avoid recursion
		const originalCreateElement = document.createElement.bind(document);

		vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
			if (tagName === 'canvas') return mockCanvas as any;
			return originalCreateElement(tagName, options);
		});
	});

	it('should render game title', () => {
		render(GameCard, { props: { game: mockGame, displayedGames: mockDisplayedGames } });
		expect(screen.getByText('Test Game')).toBeInTheDocument();
	});

	it('should open modal on click', async () => {
		render(GameCard, { props: { game: mockGame, displayedGames: mockDisplayedGames } });
		const card = screen.getByRole('button', { name: /View details for Test Game/i });
		await fireEvent.click(card);
		expect(modalStore.openViewModal).toHaveBeenCalledWith(
			mockGame,
			mockDisplayedGames,
			undefined,
			expect.any(Object)
		);
	});

	it('should adjust title styles on mobile (<768px)', async () => {
		// Mock window.innerWidth
		Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });

		// We need to mount the component to trigger the action
		render(GameCard, { props: { game: mockGame, displayedGames: mockDisplayedGames } });

		const titleElement = screen.getByText('Test Game').closest('h3');
		// On mobile, the component clears fontSize (sets to empty string)
		// This verifies the responsive behavior is active
		expect(titleElement?.style.fontSize).toBe('');
	});

	it('should show editor controls when in editor mode', async () => {
		mocks.editorMode = true;
		render(GameCard, { props: { game: mockGame, displayedGames: mockDisplayedGames } });
		expect(screen.getByTitle('Edit game')).toBeInTheDocument();
	});
});
