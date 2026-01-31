import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameEditorModal from '$lib/components/GameEditorModal.svelte';
import type { Game } from '$lib/types/game';

// Use hoisted state for mutable mock values
const mocks = vi.hoisted(() => ({
	isEditorMode: true
}));

// Mock stores
vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		get editorMode() {
			return mocks.isEditorMode;
		},
		saveLocally: vi.fn().mockResolvedValue(undefined)
	}
}));

vi.mock('$lib/stores/games.svelte', () => ({
	gamesStore: {
		games: [],
		addGame: vi.fn(),
		updateGame: vi.fn()
	}
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$app/environment', () => ({
	dev: true,
	browser: true
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => ({ html: '<i>Icon</i>' });
	return {
		X: MockIcon,
		Upload: MockIcon,
		Link: MockIcon,
		Image: MockIcon,
		Trash2: MockIcon
	};
});

describe('GameEditorModal Component', () => {
	const mockGame: Game = {
		id: 'test-game',
		title: 'Test Game',
		mainTitle: 'Test Game',
		subtitle: null,
		platform: 'PC',
		genre: 'RPG',
		year: 2023,
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/test.webp',
		playtime: '50h 0m',
		finishedDate: '2023-06-15',
		ratingPresentation: 9,
		ratingStory: 8,
		ratingGameplay: 9,
		score: 9,
		tier: 'A - Amazing'
	};

	const mockAllGames: Game[] = [mockGame];
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.isEditorMode = true;
	});

	describe('Modal Rendering', () => {
		it('renders Add Game title in create mode', () => {
			render(GameEditorModal, {
				props: {
					mode: 'create',
					initialGame: undefined,
					allGames: mockAllGames,
					onClose: mockOnClose
				}
			});

			expect(screen.getByText('Add Game')).toBeInTheDocument();
		});

		it('renders Edit Game title in edit mode', () => {
			render(GameEditorModal, {
				props: {
					mode: 'edit',
					initialGame: mockGame,
					allGames: mockAllGames,
					onClose: mockOnClose
				}
			});

			expect(screen.getByText('Edit Game')).toBeInTheDocument();
		});
	});

	describe('Form Fields', () => {
		it('populates form with initial game data in edit mode', () => {
			render(GameEditorModal, {
				props: {
					mode: 'edit',
					initialGame: mockGame,
					allGames: mockAllGames,
					onClose: mockOnClose
				}
			});

			const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
			expect(titleInput.value).toBe('Test Game');
		});

		it('starts with empty form in create mode', () => {
			render(GameEditorModal, {
				props: {
					mode: 'create',
					initialGame: undefined,
					allGames: mockAllGames,
					onClose: mockOnClose
				}
			});

			const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
			expect(titleInput.value).toBe('');
		});
	});

	describe('Close Behavior', () => {
		it('calls onClose when Escape key is pressed', async () => {
			render(GameEditorModal, {
				props: {
					mode: 'create',
					initialGame: undefined,
					allGames: mockAllGames,
					onClose: mockOnClose
				}
			});

			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(mockOnClose).toHaveBeenCalled();
		});
	});
});
