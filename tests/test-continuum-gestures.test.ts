import { describe, expect, it } from 'vitest';
import {
	CONTINUUM_CARD_ZOOM,
	ContinuumDragTracker,
	ContinuumWheelNavigator,
	constrainContinuumOffset,
	toContinuumCardOffset,
} from '#lib/components/detail-modal/continuumGestures.js';

describe('ContinuumWheelNavigator', () => {
	it('accumulates horizontal deltas until the threshold is crossed', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(40, 0)).toBe(0);
		now = 50;
		expect(navigator.push(40, 0)).toBe(1);
	});

	it('reports the direction of the accumulated travel', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(-50, 0)).toBe(0);
		now = 20;
		expect(navigator.push(-40, 0)).toBe(-1);
	});

	it('ignores vertical and diagonal-dominant scrolling', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(10, 120)).toBe(0);
		now = 20;
		expect(navigator.push(90, 120)).toBe(0);
		now = 30;
		expect(navigator.push(90, 0)).toBe(1);
	});

	it('starts a fresh gesture after an idle pause', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(60, 0)).toBe(0);
		now = 200;
		expect(navigator.push(60, 0)).toBe(0);
		now = 220;
		expect(navigator.push(30, 0)).toBe(1);
	});

	it('resets the accumulator when the direction reverses', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(60, 0)).toBe(0);
		now = 20;
		expect(navigator.push(-60, 0)).toBe(0);
		now = 40;
		expect(navigator.push(-30, 0)).toBe(-1);
	});

	it('honours the cooldown between navigations', () => {
		let now = 0;
		const navigator = new ContinuumWheelNavigator({}, () => now);

		expect(navigator.push(100, 0)).toBe(1);
		now = 100;
		expect(navigator.push(100, 0)).toBe(0);
		now = 450;
		expect(navigator.push(90, 0)).toBe(1);
	});
});

describe('ContinuumDragTracker', () => {
	it('does not activate below the start threshold', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		expect(drag.move(105, 100, 10)).toEqual({ active: false, offset: 0 });

		const movement = drag.move(107, 100, 20);
		expect(movement.active).toBe(true);
		expect(movement.offset).toBe(7);
	});

	it('cancels the gesture when the first movement is mostly vertical', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		expect(drag.move(103, 130, 10)).toEqual({ active: false, offset: 0 });
		expect(drag.move(180, 130, 20)).toEqual({ active: false, offset: 0 });
	});

	it('starts a drag when the first movement is only slightly diagonal', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		const movement = drag.move(107, 109, 10);

		expect(movement.active).toBe(true);
		expect(movement.offset).toBe(7);
	});

	it('tracks the pointer one-to-one and leaves rubber-banding to the view', () => {
		const drag = new ContinuumDragTracker();

		drag.start(200, 100, 0);

		const pull = drag.move(-200, 100, 20);
		expect(pull.active).toBe(true);
		expect(pull.offset).toBe(-400);
	});

	it('navigates past the distance threshold in both directions', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(-20, 100, 200);
		expect(drag.end(200)).toBe(1);

		drag.start(100, 100, 0);
		drag.move(220, 100, 200);
		expect(drag.end(200)).toBe(-1);
	});

	it('treats a short slow drag as a no-op', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(40, 100, 500);
		expect(drag.end(500)).toBe(0);
	});

	it('navigates on a flick even below the distance threshold', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(60, 100, 40);
		expect(drag.end(40)).toBe(1);
	});

	it('ignores tiny fast movements', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(80, 100, 10);
		expect(drag.end(10)).toBe(0);
	});

	it('returns no direction when the gesture never activated', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(102, 100, 10);
		expect(drag.end(10)).toBe(0);
	});

	it('uses a short velocity window instead of the final event segment', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(30, 100, 50);
		drag.move(29, 100, 66);

		expect(drag.end(66)).toBe(1);
	});

	it('does not treat a fast final twitch after a slow drag as a flick', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(60, 100, 500);
		drag.move(20, 100, 516);

		expect(drag.end(516)).toBe(0);
	});

	it('cancels an active gesture without reporting a direction', () => {
		const drag = new ContinuumDragTracker();

		drag.start(100, 100, 0);
		drag.move(20, 100, 20);
		drag.cancel();

		expect(drag.end(20)).toBe(0);
	});
});

describe('constrainContinuumOffset', () => {
	const bothDirections = { canGoPrevious: true, canGoNext: true };
	const nextIsEnd = { canGoPrevious: true, canGoNext: false };

	it('follows the pointer one-to-one inside the free range', () => {
		expect(constrainContinuumOffset(-300, bothDirections)).toBe(-300);
		expect(constrainContinuumOffset(300, bothDirections)).toBe(300);
	});

	it('eases into resistance without a derivative jump', () => {
		const atFree = Math.abs(constrainContinuumOffset(-320, bothDirections));
		const justPast = Math.abs(constrainContinuumOffset(-321, bothDirections));
		const nearStep = justPast - atFree;
		const farStep =
			Math.abs(constrainContinuumOffset(-421, bothDirections)) -
			Math.abs(constrainContinuumOffset(-420, bothDirections));

		expect(atFree).toBe(320);
		expect(nearStep).toBeCloseTo(1, 1);
		expect(farStep).toBeGreaterThan(0);
		expect(farStep).toBeLessThan(nearStep);
	});

	it('adds progressive resistance after the free range', () => {
		expect(constrainContinuumOffset(-620, bothDirections)).toBeCloseTo(-531.05, 1);
		expect(constrainContinuumOffset(620, bothDirections)).toBeCloseTo(531.05, 1);
	});

	it('starts resisting earlier when the drag points past an end', () => {
		expect(constrainContinuumOffset(-200, nextIsEnd)).toBeCloseTo(-185.94, 1);
	});

	it('asymptotes at the pull limit instead of folding back', () => {
		const far = Math.abs(constrainContinuumOffset(-5000, nextIsEnd));

		expect(far).toBeLessThan(320);
		expect(far).toBeGreaterThan(300);
	});

	it('only tightens the direction that has no game', () => {
		expect(constrainContinuumOffset(620, nextIsEnd)).toBeCloseTo(531.05, 1);
		expect(constrainContinuumOffset(-620, nextIsEnd)).toBeCloseTo(-303.58, 1);
	});
});

describe('toContinuumCardOffset', () => {
	it('cancels the desktop card zoom so drags track the pointer', () => {
		expect(CONTINUUM_CARD_ZOOM).toBe(1.1);
		expect(toContinuumCardOffset(-110)).toBeCloseTo(-100);
		expect(toContinuumCardOffset(0)).toBe(0);
	});
});
