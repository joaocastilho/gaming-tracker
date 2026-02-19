import { modalStore } from '$lib/stores/modal.svelte';
import type { Game } from '$lib/types/game.js';

export class SwipeController {
	// State
	swipeOffsetX = $state(0);
	swipeOffsetY = $state(0);
	isSwipeTransitioning = $state(false);
	swipeDirection = $state<'left' | 'right' | null>(null);
	isClosingGesture = $state(false);
	parallaxOffset = $state(0);

	get offsetMagnitude() {
		return (typeof window !== 'undefined' ? window.innerWidth : 300) + 20;
	}

	// Touch tracking
	private touchStartX = 0;
	private touchStartY = 0;
	private touchCurrentX = 0;
	private touchCurrentY = 0;
	private touchStartTime = 0;
	private isVerticalSwipe = false;
	private isHorizontalSwipe = false;

	// Constants
	private readonly SWIPE_THRESHOLD = 60;
	private readonly SWIPE_CLOSE_THRESHOLD = 150;
	private readonly VELOCITY_THRESHOLD = 0.8;

	// Callbacks
	private onNavigateNext: (skipTransition?: boolean) => void;
	private onNavigatePrev: (skipTransition?: boolean) => void;
	private getNextGame: () => Game | null;
	private getPrevGame: () => Game | null;
	private onSwipeStart?: () => void;

	constructor(
		onNavigateNext: (skipTransition?: boolean) => void,
		onNavigatePrev: (skipTransition?: boolean) => void,
		getNextGame: () => Game | null,
		getPrevGame: () => Game | null,
		onSwipeStart?: () => void
	) {
		this.onNavigateNext = onNavigateNext;
		this.onNavigatePrev = onNavigatePrev;
		this.getNextGame = getNextGame;
		this.getPrevGame = getPrevGame;
		this.onSwipeStart = onSwipeStart;
	}

	handleTouchStart(e: TouchEvent) {
		if (this.isSwipeTransitioning) return;

		this.onSwipeStart?.();

		const touch = e.touches[0];
		this.touchStartX = touch.screenX;
		this.touchStartY = touch.screenY;
		this.touchCurrentX = this.touchStartX;
		this.touchCurrentY = this.touchStartY;
		this.touchStartTime = Date.now();
		this.isVerticalSwipe = false;
		this.isHorizontalSwipe = false;
		this.swipeOffsetX = 0;
		this.swipeOffsetY = 0;
		this.parallaxOffset = 0;
	}

	handleTouchMove(e: TouchEvent) {
		if (this.isSwipeTransitioning) return;

		const touch = e.touches[0];
		this.touchCurrentX = touch.screenX;
		this.touchCurrentY = touch.screenY;

		const diffX = this.touchCurrentX - this.touchStartX;
		const diffY = this.touchCurrentY - this.touchStartY;

		if (
			!this.isVerticalSwipe &&
			!this.isHorizontalSwipe &&
			(Math.abs(diffX) > 10 || Math.abs(diffY) > 10)
		) {
			if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
				this.isVerticalSwipe = true;
				this.onSwipeStart?.();
			} else if (Math.abs(diffX) > Math.abs(diffY)) {
				this.isHorizontalSwipe = true;
				this.onSwipeStart?.();
			}
		}

		if (this.isVerticalSwipe && diffY > 0) {
			const resistance = 0.6;
			this.swipeOffsetY = diffY * resistance;
			this.isClosingGesture = true;
		} else if (this.isHorizontalSwipe) {
			const maxOffset = 150;
			const resistance = 0.5;

			const nextGame = this.getNextGame();
			const prevGame = this.getPrevGame();

			if (diffX > 0 && prevGame) {
				this.swipeDirection = 'right';
				this.swipeOffsetX = Math.min(diffX * resistance, maxOffset);
				this.parallaxOffset = -100 + (this.swipeOffsetX / maxOffset) * 80;
			} else if (diffX < 0 && nextGame) {
				this.swipeDirection = 'left';
				this.swipeOffsetX = Math.max(diffX * resistance, -maxOffset);
				this.parallaxOffset = 100 + (this.swipeOffsetX / maxOffset) * 80;
			} else {
				this.swipeOffsetX = diffX * 0.2;
			}
		}
	}

	handleTouchEnd() {
		const touchEndTime = Date.now();
		const duration = touchEndTime - this.touchStartTime;
		const velocity = Math.abs(this.touchCurrentX - this.touchStartX) / duration;
		const velocityY = (this.touchCurrentY - this.touchStartY) / duration;

		if (this.isClosingGesture) {
			if (this.swipeOffsetY > this.SWIPE_CLOSE_THRESHOLD || velocityY > this.VELOCITY_THRESHOLD) {
				this.animateClose();
			} else {
				this.resetVerticalPosition();
			}
		} else if (this.isHorizontalSwipe) {
			const diffX = this.touchStartX - this.touchCurrentX;
			const nextGame = this.getNextGame();
			const prevGame = this.getPrevGame();

			if (Math.abs(diffX) > this.SWIPE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD) {
				if (diffX > 0 && nextGame) {
					this.animateSwipeTransition('left');
				} else if (diffX < 0 && prevGame) {
					this.animateSwipeTransition('right');
				} else {
					this.resetSwipePosition();
				}
			} else {
				this.resetSwipePosition();
			}
		}

		this.isVerticalSwipe = false;
		this.isHorizontalSwipe = false;
		this.isClosingGesture = false;
	}

	private animateClose() {
		this.isSwipeTransitioning = true;
		const startOffset = this.swipeOffsetY;
		const targetOffset = window.innerHeight;
		const startTime = performance.now();
		const duration = 300;

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			this.swipeOffsetY = startOffset + (targetOffset - startOffset) * eased;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				modalStore.closeModal();
				this.swipeOffsetY = 0;
				this.isSwipeTransitioning = false;
			}
		};

		requestAnimationFrame(animate);
	}

	private resetVerticalPosition() {
		const startOffset = this.swipeOffsetY;
		const startTime = performance.now();
		const duration = 300;

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 4) * Math.cos(progress * Math.PI * 0.5);

			this.swipeOffsetY = startOffset * (1 - eased);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				this.swipeOffsetY = 0;
			}
		};

		requestAnimationFrame(animate);
	}

	private animateSwipeTransition(direction: 'left' | 'right') {
		this.isSwipeTransitioning = true;
		const targetOffset = direction === 'left' ? -this.offsetMagnitude : this.offsetMagnitude;
		const startOffset = this.swipeOffsetX;
		const startParallax = this.parallaxOffset;
		const targetParallax = 0;
		const startTime = performance.now();
		const duration = 250; // Slightly longer for smoother feel

		const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutCubic(progress);

			this.swipeOffsetX = startOffset + (targetOffset - startOffset) * eased;
			this.parallaxOffset = startParallax + (targetParallax - startParallax) * eased;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// Animation complete
				// Reset all state in the same tick as navigation to prevent bleeping
				if (direction === 'left') {
					this.onNavigateNext(true);
				} else {
					this.onNavigatePrev(true);
				}

				this.swipeOffsetX = 0;
				this.parallaxOffset = 0;
				this.swipeDirection = null;
				this.isSwipeTransitioning = false;
			}
		};

		requestAnimationFrame(animate);
	}

	private resetSwipePosition() {
		this.isSwipeTransitioning = true;
		const startOffset = this.swipeOffsetX;
		const startParallax = this.parallaxOffset;
		const startTime = performance.now();
		const duration = 250;

		const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutExpo(progress);

			this.swipeOffsetX = startOffset * (1 - eased);
			this.parallaxOffset = startParallax * (1 - eased);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				this.swipeOffsetX = 0;
				this.parallaxOffset = 0;
				this.isSwipeTransitioning = false;
				this.swipeDirection = null;
			}
		};

		requestAnimationFrame(animate);
	}
}
