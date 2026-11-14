import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
}));

vi.mock('$app/env', () => ({
	browser: true,
}));

import DetailModal from '#lib/components/DetailModal.svelte';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { modalStore } from '#lib/stores/modal.svelte.js';
import { windowSize } from '#lib/stores/window.svelte.js';
import { createCompletedGame } from '../helpers/factories';

const games = [
	createCompletedGame({ id: '1', title: 'Alpha' }),
	createCompletedGame({ id: '2', title: 'Bravo' }),
	createCompletedGame({ id: '3', title: 'Charlie' }),
];

describe('DetailModal accessibility', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		gamesStore.initializeGames(games);
		modalStore.reset();
		windowSize.width = 1440;
		windowSize.height = 900;
	});

	afterEach(() => {
		modalStore.reset();
		windowSize.width = 1024;
		windowSize.height = 768;
		vi.useRealTimers();
		document.body.innerHTML = '';
	});

	it('keeps only one element with the modal title id', async () => {
		modalStore.openViewModal(games[1], games);
		const { container } = render(DetailModal);
		await tick();

		expect(container.querySelectorAll('[id="modal-title"]')).toHaveLength(0);
		const ids = Array.from(container.querySelectorAll('h1[id]')).map((el) => el.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('names the dialog after the active game', async () => {
		modalStore.openViewModal(games[1], games);
		render(DetailModal);
		await tick();

		expect(screen.getByRole('dialog', { name: 'Game details: Bravo' })).toBeInTheDocument();
	});

	it('moves focus into the dialog when it opens', async () => {
		modalStore.openViewModal(games[1], games);
		render(DetailModal);
		await tick();

		const dialog = screen.getByRole('dialog');
		expect(document.activeElement).toBe(dialog);
	});

	it('returns focus to the trigger when the dialog unmounts', async () => {
		const trigger = document.createElement('button');
		document.body.appendChild(trigger);
		trigger.focus();

		modalStore.openViewModal(games[1], games);
		const { unmount } = render(DetailModal);
		await tick();

		expect(document.activeElement).not.toBe(trigger);

		await unmount();
		expect(document.activeElement).toBe(trigger);
	});

	it('wraps Shift+Tab from the container back to the last control', async () => {
		modalStore.openViewModal(games[1], games);
		render(DetailModal);
		await tick();

		const dialog = screen.getByRole('dialog');
		dialog.focus();
		await fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(document.activeElement).not.toBe(dialog);
	});
});
