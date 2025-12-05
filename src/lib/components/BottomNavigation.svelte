<script lang="ts">
	import { navigateTo } from '$lib/utils/navigationUtils';
	import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import { Gamepad, CheckCircle, Calendar, List, Search, Filter } from 'lucide-svelte';

	interface Props {
		onSearchToggle?: () => void;
		onFiltersToggle?: () => void;
		onCloseSearchAndFilters?: () => void;
	}

	let { onSearchToggle, onFiltersToggle, onCloseSearchAndFilters }: Props = $props();

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist' | 'search' | 'filters';

	type NavItem = {
		id: NavId;
		label: string;
		route?: string;
		count: number | null;
		active: boolean;
		icon: any;
	};

	let navItems = $derived.by(() => {
		const counts = filteredCountsStore.counts;
		const currentTab = appStore.activeTab;

		return [
			{
				id: 'all' as NavId,
				label: 'Games',
				route: '/',
				count: counts.all,
				active: currentTab === 'all',
				icon: Gamepad
			},
			{
				id: 'completed' as NavId,
				label: 'Completed',
				route: '/completed',
				count: counts.completed,
				active: currentTab === 'completed',
				icon: CheckCircle
			},
			{
				id: 'planned' as NavId,
				label: 'Planned',
				route: '/planned',
				count: counts.planned,
				active: currentTab === 'planned',
				icon: Calendar
			},
			{
				id: 'tierlist' as NavId,
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: currentTab === 'tierlist',
				icon: List
			},
			{
				id: 'search' as NavId,
				label: 'Search',
				count: null,
				active: false,
				icon: Search
			},
			{
				id: 'filters' as NavId,
				label: 'Filters',
				count: null,
				active: false,
				icon: Filter
			}
		] as NavItem[];
	});

	function handleNavClick(target: NavId) {
		if (target === 'search') {
			onSearchToggle?.();
		} else if (target === 'filters') {
			onFiltersToggle?.();
		} else {
			onCloseSearchAndFilters?.();
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
						<Icon size={22} strokeWidth={item.active ? 2.5 : 2} />
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
		height: 60px;
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
		color: var(--color-text-primary);
		background-color: rgba(255, 255, 255, 0.03);
	}

	.nav-button.active {
		color: var(--color-primary);
		background-color: transparent;
	}

	.icon-wrapper {
		transition: transform 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-button.active .icon-wrapper {
		transform: translateY(-2px);
	}

	.label {
		font-size: 0.65rem;
		font-weight: 500;
		line-height: 1;
		margin-top: 2px;
	}

	.nav-button.active .label {
		font-weight: 700;
	}

	.count-badge {
		position: absolute;
		top: -6px;
		right: -10px;
		background-color: var(--color-surface-completed);
		color: var(--color-text-primary);
		font-size: 0.6rem;
		font-weight: 700;
		min-width: 16px;
		height: 16px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 3px;
		border: 1px solid var(--color-border);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.bottom-navigation {
			padding-bottom: calc(env(safe-area-inset-bottom, 0));
			height: calc(60px + env(safe-area-inset-bottom, 0));
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
