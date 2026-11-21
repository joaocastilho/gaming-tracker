import { fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GameCard from '#lib/components/GameCard.js';
import { filtersStore } from '#lib/stores/filters.js';
import { modalStore } from '#lib/stores/modal.js';
import type { Game } from '#lib/types/game.js';

const mocks = vi.hoisted(() => ({
	editorMode: false,
}));

vi.mock('#lib/stores/modal.js', () => ({
	modalStore: {
		openViewModal: vi.fn(),
	},
}));

vi.mock('#lib/stores/filters.js', () => ({
	filtersStore: {
		togglePlatform: vi.fn(),
		toggleGenre: vi.fn(),
		toggleTier: vi.fn(),
		toggleCoOp: vi.fn(),
		subscribe: vi.fn(),
	},
}));

vi.mock('#lib/stores/editor.js', () => ({
	editorStore: {
		get editorMode() {
			return mocks.editorMode;
		},
	},
}));

vi.mock('#lib/stores/offline.js', () => ({
	offlineStore: {
		get isOnline() {
			return true;
		},
	},
}));

const mockContext = {
	measureText: vi.fn(() => ({ width: 50 })),
	font: '',
};
const mockCanvas = {
	getContext: vi.fn(() => mockContext),
};

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
		coOp: 'Yes',
	};

	const mockDisplayedGames = [mockGame];

	let originalInnerWidth: number;

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.editorMode = false;
		originalInnerWidth = window.innerWidth;

		global.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		};

		const originalCreateElement = document.createElement.bind(document);

		vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
			if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
			return originalCreateElement(tagName, options);
		});
	});

	afterEach(() => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		});
	});

	describe('Basic Rendering', () => {
		it('should render game title', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByText('Test Game')).toBeInTheDocument();
		});

		it('should render game subtitle when present', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByText('Subtitle')).toBeInTheDocument();
		});

		it('should render platform badge', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByText('PC')).toBeInTheDocument();
		});

		it('should render genre badge', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByText('RPG')).toBeInTheDocument();
		});

		it('should render tier badge for completed games', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const tierBadge = screen.getByRole('button', { name: /Filter by Tier/i });
			expect(tierBadge).toBeInTheDocument();
		});

		it('should not render tier badge for planned games', () => {
			const plannedGame = { ...mockGame, status: 'Planned' as const, tier: null };
			render(() => <GameCard game={plannedGame} displayedGames={mockDisplayedGames} />);
			expect(screen.queryByRole('button', { name: /Filter by Tier/i })).not.toBeInTheDocument();
		});
	});

	describe('Modal Opening', () => {
		it('should open modal on click', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const card = screen.getByRole('button', { name: /View details for Test Game/i });
			await fireEvent.click(card);
			flush();
			expect(modalStore.openViewModal).toHaveBeenCalledWith(
				mockGame,
				mockDisplayedGames,
				undefined,
				expect.any(Object)
			);
		});

		it('should open modal on Enter key', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const card = screen.getByRole('button', { name: /View details for Test Game/i });
			await fireEvent.keyDown(card, { key: 'Enter' });
			flush();
			expect(modalStore.openViewModal).toHaveBeenCalled();
		});

		it('should open modal on Space key', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const card = screen.getByRole('button', { name: /View details for Test Game/i });
			await fireEvent.keyDown(card, { key: ' ' });
			flush();
			expect(modalStore.openViewModal).toHaveBeenCalled();
		});

		it('should call onOpenModal callback if provided', async () => {
			const onOpenModal = vi.fn();
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} onOpenModal={onOpenModal} />);
			const card = screen.getByRole('button', { name: /View details for Test Game/i });
			await fireEvent.click(card);
			flush();
			expect(onOpenModal).toHaveBeenCalledWith(mockGame, mockDisplayedGames);
			expect(modalStore.openViewModal).not.toHaveBeenCalled();
		});
	});

	describe('Desktop Badge Filtering (>= 768px)', () => {
		beforeEach(() => {
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 1024,
			});
		});

		it('should toggle platform filter when platform badge is clicked', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const platformBadge = screen.getByText('PC');
			await fireEvent.click(platformBadge);
			flush();
			expect(filtersStore.togglePlatform).toHaveBeenCalledWith('PC');
		});

		it('should toggle genre filter when genre badge is clicked', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const genreBadge = screen.getByText('RPG');
			await fireEvent.click(genreBadge);
			flush();
			expect(filtersStore.toggleGenre).toHaveBeenCalledWith('RPG');
		});

		it('should toggle tier filter when tier badge is clicked', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const tierBadge = screen.getByRole('button', { name: /Filter by Tier/i });
			await fireEvent.click(tierBadge);
			flush();
			expect(filtersStore.toggleTier).toHaveBeenCalledWith('S - Masterpiece');
		});

		it('should toggle co-op filter when co-op badge is clicked', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const coOpBadge = screen.getByTitle(/co-op/i);
			await fireEvent.click(coOpBadge);
			flush();
			expect(filtersStore.toggleCoOp).toHaveBeenCalledWith('Yes');
		});

		it('should not open modal when badge is clicked', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const platformBadge = screen.getByText('PC');
			await fireEvent.click(platformBadge);
			flush();
			expect(modalStore.openViewModal).not.toHaveBeenCalled();
		});

		it('should handle keyboard Enter on platform badge', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const platformBadge = screen.getByText('PC');
			await fireEvent.keyDown(platformBadge, { key: 'Enter' });
			flush();
			expect(filtersStore.togglePlatform).toHaveBeenCalledWith('PC');
		});

		it('should handle keyboard Space on genre badge', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const genreBadge = screen.getByText('RPG');
			await fireEvent.keyDown(genreBadge, { key: ' ' });
			flush();
			expect(filtersStore.toggleGenre).toHaveBeenCalledWith('RPG');
		});

		it('should not toggle filter on invalid keyboard key', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const platformBadge = screen.getByText('PC');
			await fireEvent.keyDown(platformBadge, { key: 'Tab' });
			flush();
			expect(filtersStore.togglePlatform).not.toHaveBeenCalled();
		});
	});

	describe('Mobile Behavior (< 768px)', () => {
		beforeEach(() => {
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 500,
			});
		});

		it('should NOT toggle platform filter when platform badge is clicked on mobile', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const platformBadge = screen.getByText('PC');
			await fireEvent.click(platformBadge);
			flush();
			expect(filtersStore.togglePlatform).not.toHaveBeenCalled();
		});

		it('should NOT toggle genre filter when genre badge is clicked on mobile', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const genreBadge = screen.getByText('RPG');
			await fireEvent.click(genreBadge);
			flush();
			expect(filtersStore.toggleGenre).not.toHaveBeenCalled();
		});

		it('should NOT toggle tier filter when tier badge is clicked on mobile', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const tierBadge = screen.getByRole('button', { name: /Filter by Tier/i });
			await fireEvent.click(tierBadge);
			flush();
			expect(filtersStore.toggleTier).not.toHaveBeenCalled();
		});

		it('should NOT toggle co-op filter when co-op badge is clicked on mobile', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const coOpBadge = screen.getByTitle(/co-op/i);
			await fireEvent.click(coOpBadge);
			flush();
			expect(filtersStore.toggleCoOp).not.toHaveBeenCalled();
		});

		it('should adjust title styles on mobile', async () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const titleElement = screen.getByText('Test Game').closest('h3');
			expect(titleElement?.style.fontSize).toBe('');
		});
	});

	describe('Editor Controls', () => {
		beforeEach(() => {
			mocks.editorMode = true;
		});

		it('should show editor controls when in editor mode', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByTitle('Edit game')).toBeInTheDocument();
			expect(screen.getByTitle('Delete game')).toBeInTheDocument();
		});

		it('should hide editor controls when not in editor mode', () => {
			mocks.editorMode = false;
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.queryByTitle('Edit game')).not.toBeInTheDocument();
			expect(screen.queryByTitle('Delete game')).not.toBeInTheDocument();
		});

		it('should call onEditGame when edit button is clicked', async () => {
			const onEditGame = vi.fn();
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} onEditGame={onEditGame} />);
			const editButton = screen.getByTitle('Edit game');
			await fireEvent.click(editButton);
			flush();
			expect(onEditGame).toHaveBeenCalledWith(mockGame);
		});

		it('should call onDeleteGame when delete button is clicked', async () => {
			const onDeleteGame = vi.fn();
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} onDeleteGame={onDeleteGame} />);
			const deleteButton = screen.getByTitle('Delete game');
			await fireEvent.click(deleteButton);
			flush();
			expect(onDeleteGame).toHaveBeenCalledWith(mockGame);
		});

		it('should not open modal when edit button is clicked', async () => {
			const onEditGame = vi.fn();
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} onEditGame={onEditGame} />);
			const editButton = screen.getByTitle('Edit game');
			await fireEvent.click(editButton);
			flush();
			expect(modalStore.openViewModal).not.toHaveBeenCalled();
		});

		it('should not open modal when delete button is clicked', async () => {
			const onDeleteGame = vi.fn();
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} onDeleteGame={onDeleteGame} />);
			const deleteButton = screen.getByTitle('Delete game');
			await fireEvent.click(deleteButton);
			flush();
			expect(modalStore.openViewModal).not.toHaveBeenCalled();
		});

		it('should have correct aria-labels on editor buttons', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByRole('button', { name: /Edit Test Game/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Delete Test Game/i })).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper aria-label on card', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			expect(screen.getByRole('button', { name: /View details for Test Game/i })).toBeInTheDocument();
		});

		it('should have proper tabindex for keyboard navigation', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const card = screen.getByRole('button', { name: /View details for Test Game/i });
			expect(card).toHaveAttribute('tabindex', '0');
		});

		it('should have tier badge with correct aria-label', () => {
			render(() => <GameCard game={mockGame} displayedGames={mockDisplayedGames} />);
			const tierBadge = screen.getByRole('button', { name: /Filter by Tier S - Masterpiece/i });
			expect(tierBadge).toBeInTheDocument();
		});
	});
});
