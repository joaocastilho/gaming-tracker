import { browser } from '$app/environment';

class WindowSizeStore {
	width = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	height = $state(typeof window !== 'undefined' ? window.innerHeight : 768);

	constructor() {
		if (browser) {
			$effect.root(() => {
				$effect(() => {
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
				});
			});
		}
	}

	get isMobile() {
		return this.width < 768;
	}
}

export const windowSize = new WindowSizeStore();
