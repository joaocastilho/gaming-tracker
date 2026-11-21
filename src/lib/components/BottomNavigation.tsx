import { BarChart3, Calendar, CheckCircle, Gamepad, Home, List, Search } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Dynamic } from '@solidjs/web';
import { createMemo, For, Show } from 'solid-js';
import { appStore } from '#lib/stores/app.js';
import { filteredCountsStore } from '#lib/stores/filteredCounts.js';
import { navigateTo } from '#lib/utils/navigationUtils.js';
import { getCurrentPageState, goto } from '#lib/utils/routerBridge.js';
import './BottomNavigation.css';

export interface BottomNavigationProps {
	onSearchToggle?: () => void;
}

type NavId = 'home' | 'library' | 'completed' | 'planned' | 'stats' | 'tierlist' | 'search';

interface NavItem {
	id: NavId;
	label: string;
	route?: string;
	count: number | null;
	active: boolean;
	icon: typeof Gamepad;
}

export default function BottomNavigation(props: BottomNavigationProps): JSX.Element {
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
			{ id: 'search', label: 'Search', count: null, active: false, icon: Search },
		];
	});

	function handleNavClick(target: NavId): void {
		if (target === 'search') {
			props.onSearchToggle?.();
		} else if (target === 'home') {
			void goto('/');
		} else {
			void navigateTo(target, { state: getCurrentPageState(), replaceState: true });
		}
	}

	function handleKeyDown(event: KeyboardEvent, target: NavId): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleNavClick(target);
		}
	}

	return (
		<nav
			class="bottom-navigation bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t md:hidden"
			aria-label="Main navigation"
		>
			<ul class="flex h-full items-stretch">
				<For each={navItems()} keyed={(item) => item.id}>
					{(item) => (
						<li class="flex-1">
							<button
								type="button"
								class={[
									'nav-button flex h-full w-full flex-col items-center justify-center gap-1 px-1 transition-colors outline-none',
									{ active: item().active },
								]}
								onClick={() => handleNavClick(item().id)}
								onKeyDown={(e) => handleKeyDown(e, item().id)}
								aria-current={item().active ? 'page' : undefined}
								aria-label={`${item().label}${item().count !== null ? ` (${item().count})` : ''}`}
							>
								<div class="icon-wrapper relative">
									<Dynamic component={item().icon} size={26} strokeWidth={item().active ? 2.5 : 2} />
									<Show when={item().count !== null && (item().count ?? 0) > 0}>
										<span class="count-badge" aria-hidden="true">
											{item().count}
										</span>
									</Show>
								</div>
								<span class="label max-w-full truncate">{item().label}</span>
							</button>
						</li>
					)}
				</For>
			</ul>
		</nav>
	);
}
