<script lang="ts">
	import { browser } from '$app/environment';
	import { navigateTo } from '$lib/utils/navigationUtils';
	import { filteredCountsStore } from '$lib/stores/filteredCounts';

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist';

	type NavItem = {
		id: NavId;
		label: string;
		route: string;
		count: number | null;
		active: boolean;
		icon: string;
	};

	let navItems = $state<NavItem[]>([]);
	let filteredCounts = $state({ all: 0, completed: 0, planned: 0, tierlist: null });

	function updateNavItems() {
		let pathname = '/';
		if (browser) {
			pathname = window.location.pathname;
		}

		navItems = [
			{
				id: 'all',
				label: 'Games',
				route: '/',
				count: filteredCounts.all,
				active: pathname === '/' || pathname === '/games',
				icon: '🎮'
			},
			{
				id: 'completed',
				label: 'Completed',
				route: '/completed',
				count: filteredCounts.completed,
				active: pathname === '/completed',
				icon: '✓'
			},
			{
				id: 'planned',
				label: 'Planned',
				route: '/planned',
				count: filteredCounts.planned,
				active: pathname === '/planned',
				icon: '📝'
			},
			{
				id: 'tierlist',
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: pathname === '/tierlist',
				icon: '🏆'
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
		navigateTo(target);
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
			<li class="flex-1">
				<button
					type="button"
					class="nav-button focus:ring-primary active:bg-accent flex min-h-[60px] flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
					class:active={item.active}
					onclick={() => handleNavClick(item.id)}
					onkeydown={(e) => handleKeyDown(e, item.id)}
					aria-current={item.active ? 'page' : undefined}
					aria-label={`${item.label}${item.count !== null ? ` (${item.count})` : ''}`}
				>
					<span class="icon mb-1 text-lg" aria-hidden="true">{item.icon}</span>
					<span class="label max-w-full truncate">{item.label}</span>
					{#if item.count !== null && item.count > 0}
						<span
							class="count-badge bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-xs font-semibold"
						>
							{item.count > 99 ? '99+' : item.count}
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
		color: var(--color-muted-foreground);
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

	.nav-button.active .icon {
		transform: scale(1.1);
	}

	.icon {
		transition: transform 0.2s ease;
		line-height: 1;
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
		.icon {
			transition: none;
		}

		.nav-button {
			transition: none;
		}
	}
</style>
