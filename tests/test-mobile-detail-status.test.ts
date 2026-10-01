import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '$lib/components/detail-modal/ModalMetadata.svelte';
import { createTestGame } from './helpers/factories';

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
