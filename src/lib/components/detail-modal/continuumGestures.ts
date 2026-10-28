export type ContinuumDirection = -1 | 0 | 1;

/** The desktop modal renders a 960px card at 1056px through CSS zoom. */
export const CONTINUUM_CARD_ZOOM = 1.1;

/**
 * Converts a pointer-space offset into the card's local transform space.
 * Without this the zoomed card runs 10% ahead of the cursor.
 */
export function toContinuumCardOffset(visualOffset: number): number {
	return visualOffset / CONTINUUM_CARD_ZOOM;
}

export interface ContinuumWheelOptions {
	/** Horizontal distance that must accumulate before one navigation. */
	threshold?: number;
	/** Ignore new navigation until this long after the previous one. */
	cooldownMs?: number;
	/** A pause longer than this starts a fresh gesture. */
	idleResetMs?: number;
}

const DEFAULT_WHEEL_OPTIONS: Required<ContinuumWheelOptions> = {
	threshold: 80,
	cooldownMs: 400,
	idleResetMs: 160,
};

/**
 * Turns trackpad wheel deltas into at most one navigation per gesture.
 * Vertical-dominant input is ignored so the details column keeps scrolling.
 */
export class ContinuumWheelNavigator {
	private accumulated = 0;
	private lastEventAt = Number.NEGATIVE_INFINITY;
	private lastNavigationAt = Number.NEGATIVE_INFINITY;
	private readonly options: Required<ContinuumWheelOptions>;

	constructor(
		options: ContinuumWheelOptions = {},
		private readonly now: () => number = () => performance.now()
	) {
		this.options = { ...DEFAULT_WHEEL_OPTIONS, ...options };
	}

	reset(): void {
		this.accumulated = 0;
		this.lastEventAt = Number.NEGATIVE_INFINITY;
		this.lastNavigationAt = Number.NEGATIVE_INFINITY;
	}

	push(deltaX: number, deltaY: number): ContinuumDirection {
		const now = this.now();

		if (now - this.lastEventAt > this.options.idleResetMs) this.accumulated = 0;
		this.lastEventAt = now;

		if (deltaX === 0 || Math.abs(deltaX) <= Math.abs(deltaY)) return 0;
		if (now - this.lastNavigationAt < this.options.cooldownMs) return 0;

		if (this.accumulated !== 0 && Math.sign(this.accumulated) !== Math.sign(deltaX)) {
			this.accumulated = 0;
		}
		this.accumulated += deltaX;

		if (Math.abs(this.accumulated) < this.options.threshold) return 0;

		const direction: ContinuumDirection = this.accumulated > 0 ? 1 : -1;
		this.accumulated = 0;
		this.lastNavigationAt = now;
		return direction;
	}
}

export interface ContinuumDragOptions {
	/** Movement before the gesture locks to an axis. */
	startThreshold?: number;
	/** Raw horizontal distance that navigates on release. */
	navigateThreshold?: number;
	/** Pointer speed (px/ms) that counts as a flick. */
	flickVelocity?: number;
	/** Flicks shorter than this snap back instead of navigating. */
	flickMinDistance?: number;
}

const DEFAULT_DRAG_OPTIONS: Required<ContinuumDragOptions> = {
	startThreshold: 6,
	navigateThreshold: 96,
	flickVelocity: 0.4,
	flickMinDistance: 30,
};

export interface ContinuumDragMovement {
	active: boolean;
	/** Raw pointer travel. The view adds rubber-band resistance. */
	offset: number;
}

export class ContinuumDragTracker {
	private startX = 0;
	private startY = 0;
	private lastX = 0;
	private lastAt = 0;
	private active = false;
	private cancelled = false;
	private samples: { x: number; at: number }[] = [];
	private readonly options: Required<ContinuumDragOptions>;

	constructor(options: ContinuumDragOptions = {}) {
		this.options = { ...DEFAULT_DRAG_OPTIONS, ...options };
	}

	start(x: number, y: number, now: number = performance.now()): void {
		this.startX = x;
		this.startY = y;
		this.lastX = x;
		this.lastAt = now;
		this.active = false;
		this.cancelled = false;
		this.samples = [{ x, at: now }];
	}

	move(x: number, y: number, now: number = performance.now()): ContinuumDragMovement {
		if (this.cancelled) return { active: false, offset: 0 };

		const deltaX = x - this.startX;
		const deltaY = y - this.startY;

		if (!this.active) {
			const absX = Math.abs(deltaX);
			const absY = Math.abs(deltaY);
			if (Math.max(absX, absY) < this.options.startThreshold) {
				return { active: false, offset: 0 };
			}
			// A mouse drag rarely starts perfectly level, so only a clearly
			// vertical start gives the gesture up.
			if (absY > absX * 2) {
				this.cancelled = true;
				return { active: false, offset: 0 };
			}
			this.active = true;
		}

		this.lastX = x;
		this.lastAt = now;
		this.samples.push({ x, at: now });

		// Keep one sample before the velocity horizon so short, sparse
		// gestures still have a measurable span.
		const horizon = now - 160;
		while (this.samples.length > 2 && this.samples[1].at < horizon) this.samples.shift();

		return { active: true, offset: deltaX };
	}

	/**
	 * Returns 1 for the next game, -1 for the previous game, or 0 to snap back.
	 * Dragging left reveals the next card, matching the continuum's layout.
	 */
	end(now: number = performance.now()): ContinuumDirection {
		const wasActive = this.active;
		const deltaX = this.lastX - this.startX;
		const samples = this.samples;
		const paused = now - this.lastAt > 80;
		this.reset();

		if (!wasActive) return 0;

		const distance = Math.abs(deltaX);
		const recent = paused ? { speed: 0, direction: 0 } : this.recentMovement(now, samples);
		const flicked =
			distance >= this.options.flickMinDistance &&
			recent.speed >= this.options.flickVelocity &&
			recent.direction === Math.sign(deltaX);

		if (distance < this.options.navigateThreshold && !flicked) return 0;

		return deltaX < 0 ? 1 : -1;
	}

	cancel(): void {
		this.reset();
	}

	/** Average speed over the last 80ms, so a single final event cannot fake a flick. */
	private recentMovement(now: number, samples: { x: number; at: number }[]): { speed: number; direction: number } {
		if (samples.length < 2) return { speed: 0, direction: 0 };

		const cutoff = now - 80;
		let firstIndex = samples.length - 1;
		while (firstIndex > 0 && samples[firstIndex - 1].at >= cutoff) firstIndex--;

		const first = samples[Math.max(0, firstIndex - 1)];
		const last = samples[samples.length - 1];
		const elapsed = Math.max(1, now - first.at);
		const movement = last.x - first.x;

		return { speed: Math.abs(movement) / elapsed, direction: Math.sign(movement) };
	}

	private reset(): void {
		this.active = false;
		this.cancelled = false;
		this.lastX = this.startX;
		this.samples = [];
	}
}

export interface ContinuumDragLimits {
	canGoPrevious: boolean;
	canGoNext: boolean;
	/** 1:1 pointer travel before resistance begins. */
	freeDistance?: number;
	/** Visual distance the drag approaches asymptotically in the middle. */
	maxPull?: number;
	/** 1:1 pointer travel before resistance begins at an end of the list. */
	edgeDistance?: number;
	/** Visual distance the drag approaches asymptotically at an end. */
	edgeMaxPull?: number;
}

const DEFAULT_DRAG_LIMITS: Required<Omit<ContinuumDragLimits, 'canGoPrevious' | 'canGoNext'>> = {
	freeDistance: 320,
	maxPull: 720,
	edgeDistance: 120,
	edgeMaxPull: 320,
};

/**
 * Rubber-bands the raw drag offset. The card tracks the pointer 1:1 until the
 * free range, then follows an exponential asymptote: resistance starts with
 * derivative 1 and tightens continuously, so there is no point where the card
 * suddenly stops. Dragging toward an end of the list uses a shorter range.
 */
export function constrainContinuumOffset(
	rawOffset: number,
	{ canGoPrevious, canGoNext, ...overrides }: ContinuumDragLimits
): number {
	if (rawOffset === 0) return 0;

	const limits = { ...DEFAULT_DRAG_LIMITS, ...overrides };
	const draggingNext = rawOffset < 0;
	const atEnd = draggingNext ? !canGoNext : !canGoPrevious;
	const triedFree = atEnd ? limits.edgeDistance : limits.freeDistance;
	const triedMax = atEnd ? limits.edgeMaxPull : limits.maxPull;
	const freeDistance = Math.max(0, triedFree);
	const maxPull = Math.max(freeDistance, triedMax);
	const distance = Math.abs(rawOffset);

	if (distance <= freeDistance) return rawOffset;

	const pullRange = maxPull - freeDistance;
	if (pullRange <= 0) return Math.sign(rawOffset) * freeDistance;

	const resisted = freeDistance + pullRange * (1 - Math.exp(-(distance - freeDistance) / pullRange));

	return Math.sign(rawOffset) * resisted;
}
