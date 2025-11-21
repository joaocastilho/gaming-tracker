<script lang="ts">
	import { navigateTo } from '$lib/utils/navigationUtils';
	import { filteredCountsStore } from '$lib/stores/filteredCounts';
	import { appStore } from '$lib/stores/app.js';
	import { get } from 'svelte/store';
	import { Gamepad, CheckCircle, Calendar, List, Search, Filter } from 'lucide-svelte';

	interface Props {
		onSearchToggle?: () => void;
		onFiltersToggle?: () => void;
	}

	let { onSearchToggle, onFiltersToggle }: Props = $props();

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist' | 'search' | 'filters';

	type NavItem = {
		id: NavId;
		label: string;
		route?: string;
		count: number | null;
		active: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any; // Lucide icon component
	};

	let navItems = $state<NavItem[]>([]);
	let filteredCounts = $state({ all: 0, completed: 0, planned: 0, tierlist: null });

	function updateNavItems() {
		const activeTab = get(appStore.activeTab);

		navItems = [
			{
				id: 'all',
				label: 'Games',
				route: '/',
				count: filteredCounts.all,
				active: activeTab === 'all',
				icon: Gamepad
			},
			{
				id: 'completed',
				label: 'Completed',
				route: '/completed',
				count: filteredCounts.completed,
				active: activeTab === 'completed',
				icon: CheckCircle
			},
			{
				id: 'planned',
				label: 'Planned',
				route: '/planned',
				count: filteredCounts.planned,
				active: activeTab === 'planned',
				icon: Calendar
			},
			{
				id: 'tierlist',
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: activeTab === 'tierlist',
				icon: List
			},
			{
				id: 'search',
				label: 'Search',
				count: null,
				active: false,
				icon: Search
			},
			{
				id: 'filters',
				label: 'Filters',
				count: null,
				active: false,
				icon: Filter
			}
		];
	}

	$effect(() => {
		updateNavItems();
	});

	// Subscribe to filtered counts store to get updated counts when filters change
	filteredCountsStore.subscribe((counts) => {
		filteredCounts = counts;
		updateNavItems();
	});

	function handleNavClick(target: NavId) {
		if (target === 'search') {
			onSearchToggle?.();
		} else if (target === 'filters') {
			onFiltersToggle?.();
		} else {
			navigateTo(target as 'all' | 'completed' | 'planned' | 'tierlist');
		}
	}

	function handleKeyDown(event: KeyboardEvent, target: NavId) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleNavClick(target);
		}
	}
</script>

<!-- Bottom navigation - only visible on mobile (< 768px) -->
<nav
	class="bottom-navigation bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t md:hidden"
	aria-label="Main navigation"
>
	<ul class="flex items-stretch">
		{#each navItems as item (item.id)}
			{@const Icon = item.icon}
			<li class="flex-1">
				<button
					type="button"
					class="nav-button focus:ring-primary active:bg-accent flex min-h-[60px] flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
					class:active={item.active}
					class:font-bold={item.active}
					onclick={() => handleNavClick(item.id)}
					onkeydown={(e) => handleKeyDown(e, item.id)}
					aria-current={item.active ? 'page' : undefined}
					aria-label={`${item.label}${item.count !== null ? ` (${item.count})` : ''}`}
				>
					<div class="icon-wrapper mb-1">
						<Icon size={24} fill={item.active ? 'currentColor' : undefined} />
					</div>
					<span class="label max-w-full truncate text-[0.75rem]">{item.label}</span>
					{#if item.count !== null && item.count > 0}
						<span
							class="count-badge absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
						>
							{item.count}
						</span>
					{/if}
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
	}

	.nav-button {
		color: var(--color-text-secondary);
		position: relative;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.nav-button:hover {
		color: var(--color-foreground);
	}

	.nav-button.active {
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), 0.1);
	}

	.nav-button.active .icon-wrapper {
		transform: scale(1.1);
	}

	.icon-wrapper {
		transition: transform 0.2s ease;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.label {
		line-height: 1.2;
		font-size: 0.75rem;
	}

	.count-badge {
		font-size: 0.625rem;
		line-height: 1;
	}

	/* Ensure proper spacing for safe areas on devices with notches */
	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.bottom-navigation {
			padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.nav-button {
			border: 1px solid transparent;
		}

		.nav-button.active {
			border-color: var(--color-primary);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.icon-wrapper {
			transition: none;
		}

		.nav-button {
			transition: none;
		}
	}
</style>
