import { Gamepad2 } from '@lucide/solid';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { createMemo, createSignal, flush } from 'solid-js';
import { describe, expect, it } from 'vitest';

function CounterDemo() {
	const [count, setCount] = createSignal(0);
	const doubled = createMemo(() => count() * 2);

	return (
		<div>
			<Gamepad2 data-testid="icon" size={16} />
			<button type="button" onClick={() => setCount((c) => c + 1)}>
				Count: {count()} / Doubled: {doubled()}
			</button>
		</div>
	);
}

describe('Solid 2.0 toolchain smoke test', () => {
	it('renders Solid 2.0 signals, memos, and @lucide/solid icons in jsdom', () => {
		render(() => <CounterDemo />);

		expect(screen.getByTestId('icon')).toBeInTheDocument();
		const button = screen.getByRole('button');
		expect(button).toHaveTextContent('Count: 0 / Doubled: 0');

		fireEvent.click(button);
		flush();
		expect(button).toHaveTextContent('Count: 1 / Doubled: 2');
	});
});
