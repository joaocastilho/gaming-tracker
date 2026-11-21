import { createEffect, createRoot, runWithOwner } from 'solid-js';
import { browser } from '#lib/utils/env.js';
import { createSyncSignal } from './signalHelpers.js';

class WindowSizeStore {
	private _width = createSyncSignal<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
	private _height = createSyncSignal<number>(typeof window !== 'undefined' ? window.innerHeight : 768);

	constructor() {
		if (browser) {
			runWithOwner(null, () => {
				createRoot(() => {
					createEffect(
						() => browser,
						() => {
							let ticking = false;
							const handler = () => {
								if (ticking) return;
								ticking = true;
								requestAnimationFrame(() => {
									this.width = window.innerWidth;
									this.height = window.innerHeight;
									ticking = false;
								});
							};
							window.addEventListener('resize', handler);
							return () => window.removeEventListener('resize', handler);
						}
					);
				});
			});
		}
	}

	get width(): number {
		return this._width.get();
	}

	set width(value: number) {
		this._width.set(value);
	}

	get height(): number {
		return this._height.get();
	}

	set height(value: number) {
		this._height.set(value);
	}

	get isMobile(): boolean {
		return this.width < 768;
	}
}

export const windowSize = new WindowSizeStore();
