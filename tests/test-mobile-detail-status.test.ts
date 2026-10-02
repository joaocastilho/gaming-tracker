import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '$lib/components/detail-modal/ModalMetadata.svelte';
import ModalRatings from '$lib/components/detail-modal/ModalRatings.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

/**
 * The tier slot in the metadata row is reserved for the tier badge. A game with
 * no tier must leave that slot empty rather than filling it with a status word,
 * so it no longer reads as if the status were a ranked tier.
 */
describe('Detail modal metadata tier slot only shows an actual tier', () => {
	it('shows nothing in the tier slot for a Playing game with no tier', () => {
		const game = createTestGame({ status: 'Playing', tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeNull();
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('shows nothing in the tier slot for a Planned game with no tier', () => {
		const game = createTestGame({ status: 'Planned', tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeNull();
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('shows nothing in the tier slot for a Completed game with no tier', () => {
		const game = createCompletedGame({ tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeNull();
	});

	it('still shows the tier badge when a tier is applied', () => {
		const game = createTestGame({ status: 'Planned', tier: 'A - Amazing' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeTruthy();
	});

	it('does not render a status word for tiered games either', () => {
		const game = createCompletedGame();
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeTruthy();
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});

/**
 * The metadata row pins the tier badge to the right edge with justify-between.
 * Once untiered games stopped rendering a status word there, that left an empty
 * gap on the right. The row now packs left unless there is a tier to align.
 */
describe('Metadata badge row does not leave a gap when there is no tier', () => {
	function badgeRowClass(container: HTMLElement): string {
		return container.querySelector('.metadata-badge-row')?.className ?? '';
	}

	it('packs left when no tier is applied', () => {
		const game = createTestGame({ status: 'Planned', tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(badgeRowClass(container)).toContain('justify-start');
		expect(badgeRowClass(container)).not.toContain('justify-between');
	});

	it('still pins the tier badge right when a tier is applied', () => {
		const game = createTestGame({ status: 'Planned', tier: 'A - Amazing' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(badgeRowClass(container)).toContain('justify-between');
		expect(badgeRowClass(container)).not.toContain('justify-start');
	});

	it('packs left for a Completed game with no tier', () => {
		const game = createCompletedGame({ tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(badgeRowClass(container)).toContain('justify-start');
	});
});

describe('Detail modal score section shows the status, not a dash', () => {
	it('shows PLAYING instead of the score dash for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);

		// Uses the same badge colours as the grid game card
		expect(container.querySelector('.playing-badge')).toBeTruthy();
		expect(container.querySelector('.status-indicator')).toBeNull();

		// Score area must not render the placeholder dash
		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLAYING');

		// Landscape score slot must not render the dash either
		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED instead of the score dash for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);

		expect(container.querySelector('.planned-badge')).toBeTruthy();
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
