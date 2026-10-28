import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ContinuumPreview from '#lib/components/detail-modal/ContinuumPreview.svelte';
import { createCompletedGame, createTestGame } from './helpers/factories';

describe('ContinuumPreview', () => {
	it('renders the cover, title, year, score, and tier letter', () => {
		const game = createCompletedGame({
			title: 'Hades',
			year: 2020,
			score: 18,
			tier: 'S - Masterpiece',
		});

		const { container } = render(ContinuumPreview, {
			props: { game, direction: 'previous', depth: 0, onSelect: vi.fn() },
		});

		expect(screen.getByRole('button', { name: 'View Hades, previous game' })).toBeInTheDocument();
		expect(screen.getByText('Hades')).toBeInTheDocument();
		expect(screen.getByText('2020')).toBeInTheDocument();
		expect(screen.getByText('18/20')).toBeInTheDocument();
		expect(screen.getByText('S')).toHaveClass('tier-s');

		const image = container.querySelector('img');
		expect(image).toHaveAttribute('src', '/covers/test.webp');
	});

	it.each([
		['Planned', 'PLANNED'],
		['Playing', 'PLAYING'],
	] as const)('shows the %s status when there is no score', (status, label) => {
		const game = createTestGame({ title: 'Silksong', status });

		render(ContinuumPreview, {
			props: { game, direction: 'next', depth: 0, onSelect: vi.fn() },
		});

		expect(screen.getByText(label)).toBeInTheDocument();
	});

	it('aligns previous previews to their inner (right) edge', () => {
		const { container } = render(ContinuumPreview, {
			props: {
				game: createTestGame({ title: 'Left' }),
				direction: 'previous',
				depth: 0,
				onSelect: vi.fn(),
			},
		});

		const wrapper = container.firstElementChild;
		expect(wrapper).toHaveClass('left-[calc(50%-760px)]');

		expect(screen.getByText('Left')).toHaveClass('text-right');
	});

	it('aligns next previews to their inner (left) edge', () => {
		const { container } = render(ContinuumPreview, {
			props: {
				game: createTestGame({ title: 'Right' }),
				direction: 'next',
				depth: 0,
				onSelect: vi.fn(),
			},
		});

		const wrapper = container.firstElementChild;
		expect(wrapper).toHaveClass('left-[calc(50%+552px)]');

		expect(screen.getByText('Right')).toHaveClass('text-left');
	});

	it('places the outer preview one card further out', () => {
		const previous = render(ContinuumPreview, {
			props: {
				game: createTestGame({ title: 'Far left' }),
				direction: 'previous',
				depth: 1,
				onSelect: vi.fn(),
			},
		});
		expect(previous.container.firstElementChild).toHaveClass('left-[calc(50%-984px)]');

		const next = render(ContinuumPreview, {
			props: {
				game: createTestGame({ title: 'Far right' }),
				direction: 'next',
				depth: 1,
				onSelect: vi.fn(),
			},
		});
		expect(next.container.firstElementChild).toHaveClass('left-[calc(50%+776px)]');
	});

	it('shows how strongly the drag is leaning toward this preview', () => {
		const { container } = render(ContinuumPreview, {
			props: {
				game: createTestGame({ title: 'Focused' }),
				direction: 'next',
				depth: 0,
				emphasis: 0.6,
				onSelect: vi.fn(),
			},
		});

		const slot = container.firstElementChild;
		expect(slot).toBeInstanceOf(HTMLElement);
		if (!(slot instanceof HTMLElement)) throw new Error('Expected a preview slot');
		expect(slot.style.getPropertyValue('--preview-emphasis')).toBe('0.6');
	});

	it('calls onSelect with the previewed game', async () => {
		const game = createTestGame({ title: 'Click me' });
		const onSelect = vi.fn();

		render(ContinuumPreview, {
			props: { game, direction: 'next', depth: 0, onSelect },
		});

		screen.getByRole('button', { name: 'View Click me, next game' }).click();

		expect(onSelect).toHaveBeenCalledWith(game);
	});
});
