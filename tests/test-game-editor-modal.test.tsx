import { fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GameEditorModal from '#lib/components/GameEditorModal.js';
import type { Game } from '#lib/types/game.js';

const mocks = vi.hoisted(() => ({
	isEditorMode: true,
}));

vi.mock('#lib/stores/editor.js', () => ({
	editorStore: {
		get editorMode() {
			return mocks.isEditorMode;
		},
		saveLocally: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock('#lib/stores/games.js', () => ({
	gamesStore: {
		games: [],
		addGame: vi.fn(),
		updateGame: vi.fn(),
	},
}));

vi.mock('#lib/utils/env.js', () => ({
	dev: true,
	browser: true,
}));

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
		tier: 'A - Amazing',
	};

	const mockAllGames: Game[] = [mockGame];
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.isEditorMode = true;
	});

	describe('Modal Rendering', () => {
		it('renders Add Game title in create mode', () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			expect(screen.getByText('Add Game')).toBeInTheDocument();
		});

		it('renders Edit Game title in edit mode', () => {
			render(() => (
				<GameEditorModal mode="edit" initialGame={mockGame} allGames={mockAllGames} onClose={mockOnClose} />
			));

			expect(screen.getByText('Edit Game')).toBeInTheDocument();
		});
	});

	describe('Form Fields', () => {
		it('populates form with initial game data in edit mode', () => {
			render(() => (
				<GameEditorModal mode="edit" initialGame={mockGame} allGames={mockAllGames} onClose={mockOnClose} />
			));

			const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
			expect(titleInput.value).toBe('Test Game');
		});

		it('starts with empty form in create mode', () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
			expect(titleInput.value).toBe('');
		});
	});

	describe('Game Status Handling', () => {
		it('has Playing option in status dropdown', () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
			const playingOption = [...statusSelect.options].find((o) => o.value === 'Playing');
			expect(playingOption).toBeTruthy();
		});

		it('hides rating fields when Playing status is selected', async () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;

			await fireEvent.change(statusSelect, { target: { value: 'Completed' } });
			flush();
			expect(screen.queryByText(/presentation/i)).toBeTruthy();

			await fireEvent.change(statusSelect, { target: { value: 'Playing' } });
			flush();
			expect(screen.queryByText(/presentation/i)).toBeNull();
		});

		it('keeps playtime label as Time to Beat for Playing status', () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;

			fireEvent.change(statusSelect, { target: { value: 'Playing' } });
			flush();
			expect(screen.getByText(/time to beat/i)).toBeTruthy();
		});
	});

	describe('Close Behavior', () => {
		it('calls onClose when Escape key is pressed', async () => {
			render(() => (
				<GameEditorModal mode="create" initialGame={undefined} allGames={mockAllGames} onClose={mockOnClose} />
			));

			await fireEvent.keyDown(window, { key: 'Escape' });
			flush();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});
});
