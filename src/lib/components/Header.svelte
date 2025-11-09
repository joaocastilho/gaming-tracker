<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { appStore } from '$lib/stores/app';
	import { filtersStore } from '$lib/stores/filters';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';

	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist';

	type NavItem = {
		id: NavId;
		label: string;
		route: string;
		count: number | null;
		active: boolean;
	};

	let navItems = $state<NavItem[]>([]);

	function updateNavItems() {
		const pathname = page.url.pathname;

		navItems = [
			{
				id: 'all',
				label: 'Games',
				route: '/',
				count: $filteredGamesStore.totalCount,
				active: pathname === '/' || pathname === '/games'
			},
			{
				id: 'completed',
				label: 'Completed',
				route: '/completed',
				count: $filteredGamesStore.completedCount,
				active: pathname === '/completed'
			},
			{
				id: 'planned',
				label: 'Planned',
				route: '/planned',
				count: $filteredGamesStore.plannedCount,
				active: pathname === '/planned'
			},
			{
				id: 'tierlist',
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: pathname === '/tierlist'
			}
		];
	}

	$effect(() => {
		updateNavItems();
	});

	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function handleNavClick(target: NavId) {
		appStore.writeToURLWithFilters(filtersStore);

		if (target === 'all') {
			appStore.setActiveTab('all');
			goto('/');
		} else if (target === 'completed') {
			appStore.setActiveTab('completed');
			goto('/completed');
		} else if (target === 'planned') {
			appStore.setActiveTab('planned');
			goto('/planned');
		} else if (target === 'tierlist') {
			appStore.setActiveTab('tierlist');
			goto('/tierlist');
		}

		scrollToTop();
	}
</script>

<header class="header-root">
	<div class="header-inner">
		<button type="button" class="logo-button" onclick={() => handleNavClick('all')}>
			<Logo />
		</button>

		<nav class="tabs-nav">
			<ul class="tabs-list">
				{#each navItems as item (item.id)}
					<li>
						<button
							type="button"
							class:active={item.active}
							onclick={() => handleNavClick(item.id)}
						>
							<span class="label">{item.label}</span>
							{#if item.count !== null}
								<span class="count-badge">{item.count}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="header-right">
			<div class="theme-toggle-wrapper">
				<ThemeToggle />
			</div>
		</div>
	</div>
</header>

<style>
	.header-root {
		padding: 0.4rem 1.8rem 0.4rem;
	}

	.header-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: flex-end;
		column-gap: 1.75rem;
	}

	.logo-button {
		display: inline-flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-foreground);
		cursor: pointer;
	}

	.logo-button :global(img) {
		height: 120px;
		width: auto;
		display: block;
	}

	.tabs-nav {
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.tabs-list {
		display: inline-flex;
		align-items: flex-end;
		gap: 1.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tabs-list li {
		list-style: none;
	}

	.tabs-list button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0 0.15rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1.3rem;
		font-weight: 600;
		color: #9ca3af;
		transition:
			color 0.16s ease,
			transform 0.12s ease;
	}

	.tabs-list button .label {
		letter-spacing: 0;
		font-size: 1.3rem;
	}

	.tabs-list button .count-badge {
		min-width: 1.5rem;
		padding: 0.08rem 0.5rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.98);
		color: #9ca3af;
		font-size: 0.7rem;
		text-align: center;
	}

	.tabs-list button::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		border-radius: 999px;
		background: transparent;
		transform-origin: center;
		transform: scaleX(0);
		transition:
			background-color 0.18s ease,
			transform 0.18s ease;
	}

	.tabs-list button:hover {
		color: #e5e7eb;
		transform: translateY(-1px);
	}

	.tabs-list button:hover .count-badge {
		color: #e5e7eb;
	}

	.tabs-list button:hover::after {
		background: rgba(148, 163, 253, 0.55);
		transform: scaleX(1);
	}

	.tabs-list button.active {
		color: #e5e7eb;
	}

	.tabs-list button.active .count-badge {
		background: rgba(37, 99, 235, 0.22);
		color: #60a5fa;
	}

	.tabs-list button.active::after {
		background: #3b82f6;
		transform: scaleX(1);
	}

	.header-right {
		display: flex;
		align-items: flex-start; /* top-align container */
		justify-content: flex-end;
	}

	/* Make theme toggle bigger and pinned visually to top */
	.theme-toggle-wrapper {
		display: inline-flex;
		align-items: flex-start;
		transform: scale(1.2); /* increase size */
		transform-origin: top right;
	}
</style>
