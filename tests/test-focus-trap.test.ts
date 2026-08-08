import { describe, expect, it } from 'vitest';
import { focusTrap } from '$lib/utils/focusTrap';

function setup() {
	document.body.innerHTML = `
		<div id="container">
			<button id="first">First</button>
			<input id="second" />
			<button id="last">Last</button>
		</div>
	`;
	const container = document.getElementById('container') as HTMLElement;
	const first = document.getElementById('first') as HTMLElement;
	const last = document.getElementById('last') as HTMLElement;
	return { container, first, last };
}

function pressTab(target: HTMLElement, shiftKey = false) {
	target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }));
}

describe('focusTrap', () => {
	it('focuses the first focusable element on init', () => {
		const { container, first } = setup();
		focusTrap(container);
		expect(document.activeElement).toBe(first);
	});

	it('does nothing when there are no focusable elements', () => {
		document.body.innerHTML = '<div id="empty"></div>';
		const empty = document.getElementById('empty') as HTMLElement;
		expect(() => focusTrap(empty)).not.toThrow();
	});

	it('wraps focus from the last element to the first on Tab', () => {
		const { container, first, last } = setup();
		focusTrap(container);
		last.focus();
		pressTab(container);
		expect(document.activeElement).toBe(first);
	});

	it('wraps focus from the first element to the last on Shift+Tab', () => {
		const { container, first, last } = setup();
		focusTrap(container);
		first.focus();
		pressTab(container, true);
		expect(document.activeElement).toBe(last);
	});

	it('leaves focus alone when not at the edges', () => {
		const { container, last } = setup();
		focusTrap(container);
		last.focus();
		const input = document.getElementById('second') as HTMLElement;
		input.focus();
		pressTab(container);
		expect(document.activeElement).toBe(input);
	});

	it('stops trapping after destroy', () => {
		const { container, first, last } = setup();
		const trap = focusTrap(container);
		trap.destroy();

		last.focus();
		pressTab(container);
		expect(document.activeElement).toBe(last);
		expect(document.activeElement).not.toBe(first);
	});
});
