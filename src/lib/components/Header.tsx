import {
	BarChart3,
	Calendar,
	CheckCircle,
	Gamepad,
	Home,
	List,
	LogIn,
	LogOut,
	Plus,
	Save,
	Search,
	X,
} from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Dynamic } from '@solidjs/web';
import { createMemo, For, Show } from 'solid-js';
import OfflineIndicator from '#lib/components/OfflineIndicator.js';
import ThemeToggle from '#lib/components/ThemeToggle.js';
import { appStore } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { filteredCountsStore } from '#lib/stores/filteredCounts.js';
import { filtersStore } from '#lib/stores/filters.js';
import { browser, dev } from '#lib/utils/env.js';
import { navigateTo } from '#lib/utils/navigationUtils.js';
import { getCurrentPageState, getCurrentPathname, goto } from '#lib/utils/routerBridge.js';
import './Header.css';

export interface HeaderProps {
	onAddGame?: () => void;
	onApplyChanges?: () => void;
	onOpenLogin?: () => void;
}

type NavId = 'home' | 'library' | 'completed' | 'planned' | 'tierlist' | 'stats';

interface NavItem {
	id: NavId;
	label: string;
	route: string;
	count: number | null;
	active: boolean;
	icon: typeof Gamepad;
}

export default function Header(props: HeaderProps): JSX.Element {
	const isMac = browser && (navigator.platform ?? '').toLowerCase().includes('mac');
	const shortcutKey = isMac ? 'Cmd + /' : 'Ctrl + /';

	const navItems = createMemo<NavItem[]>(() => {
		const counts = filteredCountsStore.counts;
		const currentTab = appStore.activeTab;

		return [
			{ id: 'home', label: 'Home', route: '/', count: null, active: currentTab === 'home', icon: Home },
			{
				id: 'library',
				label: 'Library',
				route: '/library',
				count: counts.all,
				active: currentTab === 'library' || currentTab === 'all',
				icon: Gamepad,
			},
			{
				id: 'completed',
				label: 'Completed',
				route: '/completed',
				count: counts.completed,
				active: currentTab === 'completed',
				icon: CheckCircle,
			},
			{
				id: 'planned',
				label: 'Planned',
				route: '/planned',
				count: counts.planned,
				active: currentTab === 'planned',
				icon: Calendar,
			},
			{
				id: 'tierlist',
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: currentTab === 'tierlist',
				icon: List,
			},
			{ id: 'stats', label: 'Stats', route: '/stats', count: null, active: currentTab === 'stats', icon: BarChart3 },
		];
	});

	async function handleNavClick(target: NavId): Promise<void> {
		if (target === 'home') {
			await goto('/');
		} else {
			await navigateTo(target, { state: getCurrentPageState(), replaceState: true });
		}
	}

	function handleSearchToggle(): void {
		const path = getCurrentPathname();
		if (path === '/' || path === '/tierlist' || path === '/stats') {
			filtersStore.setDesktopSearchOpen(true);
			void goto('/library');
		} else {
			filtersStore.toggleDesktopSearch();
		}

		requestAnimationFrame(() => {
			const input = document.getElementById('search-input');
			if (input instanceof HTMLInputElement) {
				input.focus();
				input.select();
			}
		});
	}

	return (
		<header class="header-root mb-0 px-4 py-1 md:mb-3 md:px-6">
			<div class="header-inner container mx-auto">
				<nav class="tabs-nav">
					<ul class="tabs-list">
						<For each={navItems()} keyed={(item) => item.id}>
							{(item) => (
								<li>
									<button
										type="button"
										class={{ active: item().active }}
										aria-current={item().active ? 'page' : undefined}
										onClick={() => void handleNavClick(item().id)}
									>
										<Dynamic component={item().icon} size={20} />
										<span class="label">{item().label}</span>
									</button>
									<Show when={item().count !== null}>
										<span class="count-badge">{item().count}</span>
									</Show>
								</li>
							)}
						</For>
					</ul>
				</nav>

				<div class="header-right">
					<OfflineIndicator />

					<Show when={editorStore.editorMode}>
						<button
							type="button"
							class="editor-button add-game-button"
							onClick={() => props.onAddGame?.()}
							title="Add new game"
						>
							<Plus size={16} />
							<span class="button-label">Add Game</span>
						</button>
					</Show>

					<Show when={editorStore.editorMode && editorStore.hasPendingChanges && !dev}>
						<button
							type="button"
							class="editor-button discard-button"
							onClick={() => editorStore.discardAllChanges()}
							title="Discard all pending changes"
							disabled={editorStore.savePending}
						>
							<X size={16} />
						</button>

						<button
							type="button"
							class="editor-button apply-button"
							onClick={() => props.onApplyChanges?.()}
							disabled={editorStore.savePending}
							title="Apply all pending changes"
						>
							<Save size={16} />
							<span class="button-label">{editorStore.savePending ? 'Saving...' : 'Apply'}</span>
							<span class="pending-badge">{editorStore.pendingChangesCount}</span>
						</button>
					</Show>

					<div class="filter-toggle-wrapper hidden md:flex">
						<button
							type="button"
							class={['filter-search-toggle', { active: filtersStore.isDesktopSearchOpen }]}
							onClick={handleSearchToggle}
							aria-expanded={filtersStore.isDesktopSearchOpen ? 'true' : 'false'}
							aria-label={filtersStore.isDesktopSearchOpen ? 'Hide search' : 'Show search'}
							title={filtersStore.isDesktopSearchOpen ? `Hide search (${shortcutKey})` : `Show search (${shortcutKey})`}
						>
							<Search size={18} />
							<span class="filter-shortcut hidden md:inline" aria-hidden="true">
								{shortcutKey}
							</span>
						</button>
					</div>

					<Show
						when={editorStore.editorMode}
						fallback={
							<button
								type="button"
								class="editor-button login-button"
								onClick={() => props.onOpenLogin?.()}
								title="Login"
							>
								<LogIn size={16} />
							</button>
						}
					>
						<button
							type="button"
							class="editor-button logout-button"
							onClick={() => void editorStore.logout()}
							title="Logout"
						>
							<LogOut size={16} />
						</button>
					</Show>

					<div class="theme-toggle-wrapper">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
