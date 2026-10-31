import { fireEvent, render, screen, within } from '@testing-library/svelte';
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
import { createCompletedGame } from './helpers/factories';
import { createTouchEvent } from './setup';

const games = [
	createCompletedGame({ id: '1', title: 'Alpha', score: 18, tier: 'S - Masterpiece' }),
	createCompletedGame({ id: '2', title: 'Bravo', score: 15, tier: 'B - Great' }),
	createCompletedGame({ id: '3', title: 'Charlie', score: 12, tier: 'C - Good' }),
	createCompletedGame({ id: '4', title: 'Delta', score: 9, tier: 'D - Decent' }),
	createCompletedGame({ id: '5', title: 'Echo', score: 6, tier: 'E - Bad' }),
];

function openAt(index: number): void {
	modalStore.openViewModal(games[index], games);
}

async function settle(ms = 450): Promise<void> {
	await vi.advanceTimersByTimeAsync(ms);
}

function dispatchPointer(target: EventTarget, type: string, init: PointerEventInit): void {
	const event = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		clientX: init.clientX,
		clientY: init.clientY,
		button: init.button ?? 0,
		buttons: init.buttons ?? (type === 'pointerdown' || type === 'pointermove' ? 1 : 0),
	});

	Object.defineProperties(event, {
		pointerId: { value: init.pointerId ?? 1 },
		pointerType: { value: init.pointerType ?? 'mouse' },
	});

	target.dispatchEvent(event);
}

function getActiveCard(): HTMLElement {
	return screen.getByRole('document');
}

function getCardLayer(card: HTMLElement): HTMLElement {
	const layer = card.parentElement;
	if (!layer?.classList.contains('modal-card-layer')) {
		throw new Error('Active card is not wrapped in a continuum layer');
	}
	return layer;
}

describe('DetailModal continuum', () => {
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
	});

	it('shows the adjacent games beside the active card at 1440px', () => {
		openAt(2);
		render(DetailModal);

		expect(screen.getByRole('button', { name: 'View Bravo, previous game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View Delta, next game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Previous game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Next game' })).toBeInTheDocument();
	});

	it('keeps the existing modal below 1280px', () => {
		windowSize.width = 1279;
		openAt(2);
		render(DetailModal);

		expect(screen.queryByRole('button', { name: /^View .* previous game$/ })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^View .* next game$/ })).not.toBeInTheDocument();
	});

	it('shows two previews per side at ultrawide widths', () => {
		windowSize.width = 1920;
		openAt(2);
		render(DetailModal);

		expect(screen.getByRole('button', { name: 'View Alpha, previous game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View Bravo, previous game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View Delta, next game' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View Echo, next game' })).toBeInTheDocument();
	});

	it('marks the active card as a drag surface so pressing on text does not start a selection', () => {
		openAt(2);
		render(DetailModal);

		expect(getActiveCard()).toHaveClass('continuum-card');
	});

	it('moves the wrapper layer and leaves the zoomed card untransformed', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();
		const layer = getCardLayer(card);

		expect(layer).toHaveAttribute('data-continuum-layer', '3');
		expect(layer).toHaveAttribute('data-continuum-pos', '0');
		expect(card.style.transform).toBe('');
		expect(layer.style.transform).toContain('translate3d(0.00px');

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 570, clientY: 400 });
		await tick();

		expect(card.style.transform).toBe('');
		expect(layer.style.transform).toContain('translate3d(-130.00px');
	});

	it('fades the incoming side preview out while its full card is dragged in', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();
		const nextPreview = screen.getByRole('button', { name: 'View Delta, next game' });
		const previousPreview = screen.getByRole('button', { name: 'View Bravo, previous game' });

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 650, clientY: 400 });
		await tick();

		expect(nextPreview).toHaveClass('suppressed');
		expect(nextPreview).toHaveAttribute('aria-hidden', 'true');
		expect(previousPreview).not.toHaveClass('suppressed');

		await vi.advanceTimersByTimeAsync(200);
		dispatchPointer(window, 'pointerup', { clientX: 650, clientY: 400 });
		await settle();

		expect(nextPreview).not.toHaveClass('suppressed');
		expect(modalStore.activeGame?.id).toBe('3');
	});

	it('scopes the Firefox drag-shadow workaround to the continuum overlay', () => {
		openAt(2);
		render(DetailModal);

		expect(screen.getByRole('dialog')).toHaveClass('continuum-overlay');
	});

	it('does not apply the continuum shadow workaround below 1280px', () => {
		windowSize.width = 1279;
		openAt(2);
		render(DetailModal);

		expect(screen.getByRole('dialog')).not.toHaveClass('continuum-overlay');
	});

	it('leaves text selectable on the card below 1280px', () => {
		windowSize.width = 1279;
		openAt(2);
		render(DetailModal);

		expect(getActiveCard()).not.toHaveClass('continuum-card');
	});

	it('does not wrap past the ends of the list', () => {
		openAt(0);
		render(DetailModal);

		expect(screen.queryByRole('button', { name: /^View .* previous game$/ })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Previous game' })).not.toBeInTheDocument();
	});

	it('navigates when a preview is clicked and keeps focus in the dialog', async () => {
		openAt(2);
		render(DetailModal);

		await fireEvent.click(screen.getByRole('button', { name: 'View Delta, next game' }));

		expect(modalStore.activeGame?.id).toBe('3');
		expect(document.activeElement).toBe(screen.getByRole('dialog'));

		await settle();
		expect(modalStore.activeGame?.id).toBe('4');
	});

	it('navigates with a horizontal wheel gesture, once per gesture', async () => {
		openAt(2);
		render(DetailModal);

		const dialog = screen.getByRole('dialog');

		await fireEvent.wheel(dialog, { deltaX: 120, deltaY: 0 });
		expect(modalStore.activeGame?.id).toBe('3');

		await settle();
		expect(modalStore.activeGame?.id).toBe('4');

		await fireEvent.wheel(dialog, { deltaX: 120, deltaY: 0 });
		await settle();
		expect(modalStore.activeGame?.id).toBe('5');
	});

	it('leaves vertical wheel input to the page', async () => {
		openAt(2);
		render(DetailModal);

		await fireEvent.wheel(screen.getByRole('dialog'), { deltaX: 5, deltaY: 120 });

		expect(modalStore.activeGame?.id).toBe('3');
	});

	it('keeps keyboard arrow navigation', async () => {
		openAt(2);
		render(DetailModal);

		await fireEvent.keyDown(document, { key: 'ArrowRight' });
		expect(modalStore.activeGame?.id).toBe('3');

		await settle();
		expect(modalStore.activeGame?.id).toBe('4');

		await fireEvent.keyDown(document, { key: 'ArrowLeft' });
		await settle();
		expect(modalStore.activeGame?.id).toBe('3');
	});

	it('commits a touch swipe immediately instead of starting a second turn', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();
		card.dispatchEvent(createTouchEvent('touchstart', [{ screenX: 700, screenY: 400 }]));
		card.dispatchEvent(createTouchEvent('touchmove', [{ screenX: 550, screenY: 400 }]));
		await vi.advanceTimersByTimeAsync(20);

		card.dispatchEvent(createTouchEvent('touchend', [{ screenX: 550, screenY: 400 }]));
		await vi.advanceTimersByTimeAsync(180);
		await tick();

		expect(modalStore.activeGame?.id).toBe('4');
		expect(getActiveCard()).not.toHaveClass('continuum-entering-next');
	});

	it('drags the card with the pointer and turns to the next game on release', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 570, clientY: 400 });
		await tick();

		// The wrapper layer tracks the pointer 1:1; the zoomed card inside is
		// never transformed, so it stays a cached compositor surface.
		expect(getCardLayer(card).style.transform).toContain('translate3d(-130.00px');

		dispatchPointer(window, 'pointerup', { clientX: 570, clientY: 400 });

		expect(modalStore.activeGame?.id).toBe('3');
		await settle();
		expect(modalStore.activeGame?.id).toBe('4');
	});

	it('drags the card to the previous game when pulled right', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 840, clientY: 400 });
		await tick();

		expect(getCardLayer(card).style.transform).toContain('translate3d(140.00px');

		dispatchPointer(window, 'pointerup', { clientX: 840, clientY: 400 });

		expect(modalStore.activeGame?.id).toBe('3');
		await settle();
		expect(modalStore.activeGame?.id).toBe('2');
	});

	it('stops tracking when a move reports the button is already up', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 650, clientY: 400 });
		await vi.advanceTimersByTimeAsync(100);

		// The release happened outside the window, so the next move arrives
		// without a pressed button.
		dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 400, buttons: 0 });
		await settle();

		expect(modalStore.activeGame?.id).toBe('3');
		expect(getCardLayer(getActiveCard()).style.transform).toContain('translate3d(0.00px');

		dispatchPointer(window, 'pointermove', { clientX: 200, clientY: 400, buttons: 0 });
		await tick();

		expect(getCardLayer(getActiveCard()).style.transform).toContain('translate3d(0.00px');
	});

	it('commits a drag whose release was missed', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 590, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 400, buttons: 0 });
		await settle();

		expect(modalStore.activeGame?.id).toBe('4');
	});

	it('cancels a drag when the window loses focus', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 590, clientY: 400 });
		window.dispatchEvent(new Event('blur'));
		await settle();

		expect(modalStore.activeGame?.id).toBe('3');
		expect(getCardLayer(getActiveCard()).style.transform).toContain('translate3d(0.00px');
	});

	it('centres the incoming card when reduced motion skips the turn', async () => {
		vi.mocked(window.matchMedia).mockImplementation((query) => ({
			matches: query === '(prefers-reduced-motion: reduce)',
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(() => false),
		}));

		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 570, clientY: 400 });
		dispatchPointer(window, 'pointerup', { clientX: 570, clientY: 400 });
		await tick();

		expect(modalStore.activeGame?.id).toBe('4');
		expect(getCardLayer(getActiveCard()).style.transform).toContain('translate3d(0.00px');
	});

	it('animates the incoming card from the side the turn came from', async () => {
		openAt(2);
		const { container } = render(DetailModal);

		const card = getActiveCard();
		const activeLayer = getCardLayer(card);
		const incomingCard = container.querySelectorAll<HTMLElement>('.modal-content')[2];
		const incomingLayer = getCardLayer(incomingCard);

		// At rest, the next neighbour card waits off to the right at opacity 0
		// while remaining visibility: visible so Firefox pre-promotes its GPU layer.
		expect(incomingLayer.style.transform).toContain('translate3d(260.00px');
		expect(incomingLayer.style.opacity).toBe('0');
		expect(incomingLayer.style.visibility).toBe('visible');
		expect(incomingCard).not.toHaveClass('shadow-2xl');

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 570, clientY: 400 });
		await tick();

		// During the drag the active layer follows the pointer and the incoming
		// layer glides in proportionally; both are fully opaque so neither card
		// shows through the other.
		expect(activeLayer.style.transform).toContain('translate3d(-130.00px');
		expect(activeLayer.style.opacity).toBe('1');
		expect(incomingLayer.style.transform).toContain('translate3d(179.52px');
		expect(incomingLayer.style.opacity).toBe('1');
		expect(incomingLayer.style.visibility).toBe('visible');

		dispatchPointer(window, 'pointerup', { clientX: 570, clientY: 400 });
		// One tick renders the exiting phase, the next lets the turn start its
		// animations against the captured layers.
		await tick();
		await tick();

		// On release both layers animate simultaneously to their final frames:
		// the outgoing card clears the viewport, the incoming card lands at 0.
		// 1440 / 2 + 1056 / 2 + 16 = 1264px.
		expect(activeLayer.style.transform).toContain('translate3d(-1264.00px');
		expect(activeLayer.style.opacity).toBe('1');
		expect(incomingLayer.style.transform).toContain('translate3d(0px, 0px, 0)');
		expect(incomingLayer.style.opacity).toBe('1');

		await vi.advanceTimersByTimeAsync(260);
		await tick();

		expect(modalStore.activeGame?.id).toBe('4');
		expect(getCardLayer(getActiveCard()).style.transform).toContain('translate3d(0.00px');
		expect(getCardLayer(getActiveCard()).style.opacity).toBe('1');
	});

	it('continues moving the outgoing card forward when released past the exit distance', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 900, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 400 });
		await tick();

		const draggedX = Number(getCardLayer(card).style.transform.match(/translate3d\(([-\d.]+)px/)?.[1]);
		expect(draggedX).toBeLessThan(-400);

		dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 400 });
		// One tick renders the exiting phase, the next lets the turn start its
		// animations against the captured layers.
		await tick();
		await tick();

		const exitingX = Number(getCardLayer(card).style.transform.match(/translate3d\(([-\d.]+)px/)?.[1]);
		expect(exitingX).toBeLessThan(draggedX);

		await settle();
		expect(modalStore.activeGame?.id).toBe('4');
	});

	it('ignores another navigation while the page is turning', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 570, clientY: 400 });
		dispatchPointer(window, 'pointerup', { clientX: 570, clientY: 400 });

		await fireEvent.keyDown(document, { key: 'ArrowRight' });
		await settle();

		expect(modalStore.activeGame?.id).toBe('4');
	});

	it('snaps back when the drag does not reach the turn threshold', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		await vi.advanceTimersByTimeAsync(500);
		dispatchPointer(window, 'pointermove', { clientX: 660, clientY: 400 });
		dispatchPointer(window, 'pointerup', { clientX: 660, clientY: 400 });

		await settle();
		expect(modalStore.activeGame?.id).toBe('3');
		expect(getCardLayer(card).style.transform).toContain('translate3d(0.00px');
	});

	it('ignores a mostly vertical drag', async () => {
		openAt(2);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 710, clientY: 480 });
		dispatchPointer(window, 'pointerup', { clientX: 710, clientY: 480 });

		await settle();
		expect(modalStore.activeGame?.id).toBe('3');
	});

	it('does not turn past the first game', async () => {
		openAt(0);
		render(DetailModal);

		const card = getActiveCard();

		dispatchPointer(card, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 900, clientY: 400 });
		dispatchPointer(window, 'pointerup', { clientX: 900, clientY: 400 });

		await settle();
		expect(modalStore.activeGame?.id).toBe('1');
		expect(getCardLayer(card).style.transform).toContain('translate3d(0.00px');
	});

	it('does not start a drag from an interactive control', async () => {
		openAt(2);
		render(DetailModal);

		const share = within(getActiveCard()).getAllByRole('button', { name: 'Share Charlie' })[0];

		dispatchPointer(share, 'pointerdown', { clientX: 700, clientY: 400 });
		dispatchPointer(window, 'pointermove', { clientX: 560, clientY: 400 });
		dispatchPointer(window, 'pointerup', { clientX: 560, clientY: 400 });

		await settle();
		expect(modalStore.activeGame?.id).toBe('3');
	});
});
