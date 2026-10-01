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

describe('Detail modal score/status badge matches game card design', () => {
	it('shows PLAYING badge (same classes as game card) for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		// Same badge design as the grid game card
		expect(container.querySelector('.playing-badge')).toBeTruthy();
		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);

		// Score area must not render the placeholder dash
		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');

		// Landscape score slot must not render the dash either
		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED badge (same classes as game card) for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(container.querySelector('.planned-badge')).toBeTruthy();
		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
	});

	it('shows score badge with Award icon (same as game card) for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(ModalRatings, { props: { game } });

		const badge = container.querySelector('.score-result .score-badge');
		expect(badge).toBeTruthy();
		expect(badge?.textContent).toContain('8');
		expect(badge?.querySelector('svg')).toBeTruthy();

		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});
