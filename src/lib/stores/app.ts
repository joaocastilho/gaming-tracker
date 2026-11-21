import { createEffect, createRoot, runWithOwner } from 'solid-js';
import { createSyncSignal } from './signalHelpers.js';

export type ThemeValue = 'dark' | 'light';
export type TabValue = 'all' | 'completed' | 'planned' | 'tierlist' | 'stats' | 'home' | 'library';

export interface AppState {
	theme: ThemeValue;
	activeTab: TabValue;
}

class AppStore {
	private _theme = createSyncSignal<ThemeValue>('dark');
	private _activeTab = createSyncSignal<TabValue>('home');

	constructor() {
		if (
			typeof window !== 'undefined' &&
			typeof window.localStorage !== 'undefined' &&
			typeof window.localStorage.getItem === 'function'
		) {
			const savedTheme = window.localStorage.getItem('gaming-tracker-theme');
			if (savedTheme === 'dark' || savedTheme === 'light') {
				this._theme.set(savedTheme);
			}

			runWithOwner(null, () => {
				createRoot(() => {
					createEffect(
						() => this._theme.get(),
						(theme) => {
							window.localStorage.setItem('gaming-tracker-theme', theme);
							document.documentElement.classList.add('theme-transitioning');
							document.documentElement.classList.remove('light', 'dark');
							document.documentElement.classList.add(theme);
							const timeoutId = setTimeout(() => {
								if (typeof document !== 'undefined') {
									document.documentElement.classList.remove('theme-transitioning');
								}
							}, 250);
							return () => clearTimeout(timeoutId);
						}
					);
				});
			});
		}
	}

	get theme(): ThemeValue {
		return this._theme.get();
	}

	set theme(value: ThemeValue) {
		this._theme.set(value);
	}

	get activeTab(): TabValue {
		return this._activeTab.get();
	}

	set activeTab(value: TabValue) {
		this._activeTab.set(value);
	}

	get appState(): AppState {
		return {
			theme: this.theme,
			activeTab: this.activeTab,
		};
	}

	toggleTheme(): void {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
	}

	setTheme(newTheme: ThemeValue): void {
		this.theme = newTheme;
	}

	setActiveTab(tab: TabValue, force = false): void {
		if (force || this.activeTab !== tab) {
			this.activeTab = tab;
		}
	}
}

export const appStore = new AppStore();
export type { AppStore };
