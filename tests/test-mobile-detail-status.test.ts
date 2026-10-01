import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '$lib/components/detail-modal/ModalMetadata.svelte';
import ModalRatings from '$lib/components/detail-modal/ModalRatings.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

describe('Mobile detail modal status badge', () => {
	it('shows PLAYING badge for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(screen.getByText('PLAYING')).toBeTruthy();
		expect(container.querySelector('.playing-badge')).toBeTruthy();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('shows PLANNED badge for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(screen.getByText('PLANNED')).toBeTruthy();
		expect(container.querySelector('.planned-badge')).toBeTruthy();
		expect(screen.queryByText('PLAYING')).toBeNull();
	});
});

describe('Detail modal score section shows status, not dash', () => {
	it('shows PLAYING instead of score dash for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);
		expect(container.querySelector('.playing-badge')).toBeTruthy();

		// Score area must not render the placeholder dash
		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');

		// Landscape score slot must not render the dash either
		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED instead of score dash for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);
		expect(container.querySelector('.planned-badge')).toBeTruthy();

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
	});

	it('shows actual score for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(ModalRatings, { props: { game } });

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).toContain('8');
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});
