import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ResultCount from '#lib/components/ResultCount.svelte';

describe('ResultCount', () => {
	test('renders a pluralized, filter-aware count', () => {
		render(ResultCount, { props: { count: 12 } });
		expect(screen.getByText('12 games')).toBeInTheDocument();

		render(ResultCount, { props: { count: 1 } });
		expect(screen.getByText('1 game')).toBeInTheDocument();

		render(ResultCount, { props: { count: 0, filtered: true } });
		expect(screen.getByText('0 games match your filters')).toBeInTheDocument();
	});

	test('exposes a polite live region so filter changes are announced', () => {
		const { container } = render(ResultCount, { props: { count: 4 } });
		const status = screen.getByRole('status');

		expect(status).toHaveAttribute('aria-live', 'polite');
		expect(container.querySelector('p, span, div')).not.toBeNull();
	});
});
