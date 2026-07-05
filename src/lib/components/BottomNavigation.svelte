<script lang="ts">
import { navigateTo } from '$lib/utils/navigationUtils';
import { goto } from '$app/navigation';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
import { appStore } from '$lib/stores/app.svelte';
import { page } from '$app/state';
import { Gamepad, CheckCircle, Calendar, List, Search, Home, BarChart3 } from '@lucide/svelte';

interface Props {
	onSearchToggle?: () => void;
}

let { onSearchToggle }: Props = $props();

type NavId = 'home' | 'library' | 'completed' | 'planned' | 'stats' | 'tierlist' | 'search';

type NavItem = {
	id: NavId;
	label: string;
	route?: string;
	count: number | null;
	active: boolean;
	icon: typeof Gamepad;
};

function createNavItem<T extends NavId>(
	id: T,
	label: string,
	count: number | null,
	active: boolean,
	icon: typeof Gamepad,
	route?: string
): NavItem {
	return { id, label, route, count, active, icon };
}

let navItems = $derived.by(() => {
	const counts = filteredCountsStore.counts;
	const currentTab = appStore.activeTab;

	return [
		createNavItem('home', 'Home', null, currentTab === 'home', Home, '/'),
		createNavItem(
			'library',
			'Library',
			counts.all,
			currentTab === 'library' || currentTab === 'all',
			Gamepad,
			'/library'
		),
		createNavItem('completed', 'Completed', counts.completed, currentTab === 'completed', CheckCircle, '/completed'),
		createNavItem('planned', 'Planned', counts.planned, currentTab === 'planned', Calendar, '/planned'),
		createNavItem('tierlist', 'Tier List', null, currentTab === 'tierlist', List, '/tierlist'),
		createNavItem('stats', 'Stats', null, currentTab === 'stats', BarChart3, '/stats'),
		createNavItem('search', 'Search', null, false, Search),
	];
});

function handleNavClick(target: NavId) {
	if (target === 'search') {
		onSearchToggle?.();
	} else if (target === 'home') {
		goto('/');
	} else {
		navigateTo(target, { state: page.state, replaceState: true });
	}
}

function handleKeyDown(event: KeyboardEvent, target: NavId) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		handleNavClick(target);
	}
}
</script>

<nav
	class="bottom-navigation bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t md:hidden"
	aria-label="Main navigation"
>
	<ul class="flex h-full items-stretch">
		{#each navItems as item (item.id)}
			{@const Icon = item.icon}
			<li class="flex-1">
				<button
					type="button"
					class="nav-button flex h-full w-full flex-col items-center justify-center gap-1 px-1 transition-colors outline-none"
					class:active={item.active}
					onclick={() => handleNavClick(item.id)}
					onkeydown={(e) => handleKeyDown(e, item.id)}
					aria-current={item.active ? 'page' : undefined}
					aria-label={`${item.label}${item.count !== null ? ` (${item.count})` : ''}`}
				>
					<div class="icon-wrapper relative">
						<Icon size={26} strokeWidth={item.active ? 2.5 : 2} />
						{#if item.count !== null && item.count > 0}
							<span class="count-badge">
								{item.count}
							</span>
						{/if}
					</div>
					<span class="label max-w-full truncate">{item.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.bottom-navigation {
		height: 80px;
		padding-bottom: env(safe-area-inset-bottom, 0);
		background-color: var(--color-background);
		border-color: var(--color-border);
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		/* Force GPU compositing to keep nav pinned during scroll on Firefox mobile */
		transform: translateZ(0);
		will-change: transform;
		-webkit-transform: translateZ(0);
	}

	.nav-button {
		color: var(--color-text-secondary);
		position: relative;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.nav-button:hover {
			color: var(--color-text-primary);
			background-color: rgba(99, 102, 241, 0.03);
		}

		:global(.light) .nav-button:hover {
			background-color: rgba(234, 88, 12, 0.03);
		}
	}

	.nav-button.active {
		color: var(--color-primary);
		background-color: transparent;
	}

	.icon-wrapper {
		transition: transform 0.12s ease-out;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-button.active .icon-wrapper {
		transform: translateY(-2px);
	}

	.label {
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1;
		margin-top: 2px;
	}

	.nav-button.active .label {
		font-weight: 700;
	}

	.count-badge {
		position: absolute;
		top: -8px;
		right: -12px;
		background-color: var(--color-surface-completed);
		color: var(--color-text-primary);
		font-size: 0.7rem;
		font-weight: 700;
		min-width: 20px;
		height: 20px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
		border: 1px solid var(--color-border);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.bottom-navigation {
			padding-bottom: calc(env(safe-area-inset-bottom, 0));
			height: calc(80px + env(safe-area-inset-bottom, 0));
		}
	}

	@media (prefers-contrast: more) {
		.nav-button {
			border: 1px solid transparent;
		}

		.nav-button.active {
			border-color: var(--color-primary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-wrapper {
			transition: none;
		}

		.nav-button {
			transition: none;
		}
	}
</style>
