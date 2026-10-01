import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '$lib/components/detail-modal/ModalMetadata.svelte';
import ModalRatings from '$lib/components/detail-modal/ModalRatings.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

describe('Mobile detail modal status word (plain text, no colored badge)', () => {
	it('shows the word PLAYING as plain text for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalMetadata, { props: { game } });

		const word = screen.getByText('PLAYING');
		expect(word).toBeTruthy();
		expect(word.className).not.toContain('badge');
		expect(container.querySelector('.playing-badge')).toBeNull();
		expect(container.querySelector('.status-indicator')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('shows the word PLANNED as plain text for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalMetadata, { props: { game } });

		const word = screen.getByText('PLANNED');
		expect(word).toBeTruthy();
		expect(word.className).not.toContain('badge');
		expect(container.querySelector('.planned-badge')).toBeNull();
		expect(container.querySelector('.status-indicator')).toBeNull();
		expect(screen.queryByText('PLAYING')).toBeNull();
	});
});

describe('Detail modal score section shows status word, not dash or badge', () => {
	it('shows PLAYING word instead of score dash for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);

		// No colored badge pill — plain word only
		expect(container.querySelector('.playing-badge')).toBeNull();
		expect(container.querySelector('.status-indicator')).toBeNull();

		// Score area must not render the placeholder dash
		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLAYING');

		// Landscape score slot must not render the dash either
		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED word instead of score dash for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);

		expect(container.querySelector('.planned-badge')).toBeNull();
		expect(container.querySelector('.status-indicator')).toBeNull();

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLANNED');
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
