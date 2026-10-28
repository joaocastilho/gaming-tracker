import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalRatings from '#lib/components/detail-modal/ModalRatings.svelte';
import { createCompletedGame, createTestGame } from './helpers/factories';

function normalize(text: string | null | undefined): string {
	return (text ?? '').replace(/\s+/g, ' ').trim();
}

describe('ModalRatings rating breakdown', () => {
	it('renders one labelled card per category', () => {
		const game = createCompletedGame({
			ratingPresentation: 8,
			ratingStory: 7,
			ratingGameplay: 9,
		});

		const { container } = render(ModalRatings, { props: { game } });

		const labels = Array.from(container.querySelectorAll('.rating-label')).map((label) => normalize(label.textContent));
		expect(labels).toEqual(['Presentation', 'Story', 'Gameplay']);

		const values = Array.from(container.querySelectorAll('.rating-card')).map((card) => normalize(card.textContent));
		expect(values[0]).toContain('8');
		expect(values[1]).toContain('7');
		expect(values[2]).toContain('9');
	});

	it('dims only the missing category instead of the whole row', () => {
		const game = createCompletedGame({
			ratingPresentation: 8,
			ratingStory: null,
			ratingGameplay: 7,
		});

		const { container } = render(ModalRatings, { props: { game } });

		const cards = Array.from(container.querySelectorAll('.rating-card'));
		expect(cards[0]?.classList.contains('is-empty')).toBe(false);
		expect(cards[1]?.classList.contains('is-empty')).toBe(true);
		expect(cards[2]?.classList.contains('is-empty')).toBe(false);
	});

	it('exposes the rating scale to assistive technology', () => {
		const game = createCompletedGame({
			ratingPresentation: 8,
			ratingStory: null,
			ratingGameplay: 7,
		});

		const { container } = render(ModalRatings, { props: { game } });

		expect(normalize(container.querySelector('dd')?.textContent)).toContain('8 out of 10');
		expect(normalize(container.querySelectorAll('dd')[1]?.textContent)).toContain('not rated');
	});

	it('explains each value on hover', () => {
		const game = createCompletedGame({
			ratingPresentation: 8,
			ratingStory: null,
			ratingGameplay: 7,
		});

		const { container } = render(ModalRatings, { props: { game } });

		const cards = Array.from(container.querySelectorAll('.rating-card'));
		expect(cards[0]?.getAttribute('title')).toBe('Presentation: 8/10');
		expect(cards[1]?.getAttribute('title')).toBe('Story: not rated');
	});
});

describe('ModalRatings tier verdict', () => {
	it('shows the tier beside the score in one verdict strip', () => {
		const game = createCompletedGame({ tier: 'A - Amazing', score: 17 });

		const { container } = render(ModalRatings, { props: { game } });

		const strip = container.querySelector('.verdict-strip');
		expect(strip).toBeTruthy();

		const tier = strip?.querySelector('.verdict-tier');
		expect(tier).toBeTruthy();
		expect(normalize(tier?.textContent)).toContain('A');
		expect(normalize(tier?.textContent)).toContain('Amazing');
		expect(tier?.classList.contains('tier-a')).toBe(true);

		expect(normalize(strip?.querySelector('.score-badge')?.textContent)).toContain('17');
	});

	it('splits the S tier into its letter and name', () => {
		const game = createCompletedGame({ tier: 'S - Masterpiece', score: 19 });

		const { container } = render(ModalRatings, { props: { game } });

		const tier = container.querySelector('.verdict-tier');
		expect(normalize(tier?.textContent)).toBe('S – Masterpiece');
		expect(tier?.classList.contains('tier-s')).toBe(true);
	});

	it('renders the score alone when the game has no tier', () => {
		const game = createCompletedGame({ tier: null, score: 17 });

		const { container } = render(ModalRatings, { props: { game } });

		const strip = container.querySelector('.verdict-strip');
		expect(strip?.querySelector('.verdict-tier')).toBeNull();
		expect(strip?.querySelector('.score-badge')).toBeTruthy();
	});

	it('fills each rating meter in proportion to its value', () => {
		const game = createCompletedGame({
			ratingPresentation: 8,
			ratingStory: null,
			ratingGameplay: 5,
		});

		const { container } = render(ModalRatings, { props: { game } });

		const cards = Array.from(container.querySelectorAll('.rating-card'));
		expect(cards[0]?.getAttribute('style')).toContain('--rating-fill: 80%');
		expect(cards[1]?.getAttribute('style')).toContain('--rating-fill: 0%');
		expect(cards[2]?.getAttribute('style')).toContain('--rating-fill: 50%');
	});
});

describe('ModalRatings score panel', () => {
	it('shows the score and its /20 scale without a text caption', () => {
		const game = createCompletedGame({ score: 17 });

		const { container } = render(ModalRatings, { props: { game } });

		const scoreResult = container.querySelector('.score-result');
		const text = normalize(scoreResult?.textContent);
		expect(text).not.toContain('Score');
		expect(text).toContain('17');
		expect(text).toContain('/20');
	});

	it('keeps the dash placeholder when a completed game has no score', () => {
		const game = createCompletedGame({ score: null });

		const { container } = render(ModalRatings, { props: { game } });

		const text = normalize(container.querySelector('.score-result')?.textContent);
		expect(text).not.toContain('Score');
		expect(text).toContain('-');
		expect(text).not.toContain('/20');
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('does not show a score for planned games', () => {
		const game = createTestGame({ status: 'Planned', score: null });

		const { container } = render(ModalRatings, { props: { game } });

		const text = normalize(container.querySelector('.score-result')?.textContent);
		expect(text).toBe('PLANNED');
		expect(container.querySelector('.planned-badge')).toBeTruthy();
	});
});
