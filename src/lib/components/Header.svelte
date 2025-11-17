<script lang="ts">
	import { navigateTo, navigateToAndReset } from '$lib/utils/navigationUtils';
	import { goto } from '$app/navigation';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';

	import { get } from 'svelte/store';
	import { appStore } from '$lib/stores/app';
	import { filtersStore } from '$lib/stores/filters';
	import { filteredCountsStore } from '$lib/stores/filteredCounts';

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist';

	type NavItem = {
		id: NavId;
		label: string;
		route: string;
		count: number | null;
		active: boolean;
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
				active: activeTab === 'all'
			},
			{
				id: 'completed',
				label: 'Completed',
				route: '/completed',
				count: filteredCounts.completed,
				active: activeTab === 'completed'
			},
			{
				id: 'planned',
				label: 'Planned',
				route: '/planned',
				count: filteredCounts.planned,
				active: activeTab === 'planned'
			},
			{
				id: 'tierlist',
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: activeTab === 'tierlist'
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

	let loginModalRef: InstanceType<typeof LoginModal> | null = null;

	function openOwnerLogin() {
		if (loginModalRef && typeof loginModalRef.openModal === 'function') {
			loginModalRef.openModal();
		}
	}

	function handleLogoClick() {
		// Logo click should clear filters
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		appStore.setActiveTab('all', true);

		// Navigate to Games tab
		const route = '/';
		goto(route, {
			replaceState: false,
			noScroll: false,
			keepFocus: true
		});

		// Scroll to top
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	async function handleNavClick(target: NavId) {
		// Tab navigation should preserve filters (or reset for tierlist)
		if (target === 'tierlist') {
			await navigateToAndReset(target);
		} else {
			await navigateTo(target);
		}
	}
</script>

<LoginModal bind:this={loginModalRef} />

<header class="header-root">
	<div class="header-inner">
		<button type="button" class="logo-button" onclick={handleLogoClick}>
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
						</button>
						{#if item.count !== null}
							<span class="count-badge">{item.count}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="header-right">
			<div class="theme-toggle-wrapper">
				<ThemeToggle />
			</div>

			<button
				type="button"
				class="owner-login-button"
				onclick={openOwnerLogin}
				aria-label="Owner login"
			>
				<span class="dot"></span>
				<span class="label">Owner</span>
			</button>
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
		grid-template-columns: 1fr;
		grid-template-rows: auto auto;
		gap: 0.5rem;
		align-items: flex-end;
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
		grid-row: 1;
		grid-column: 1;
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
		grid-row: 2;
		grid-column: 1;
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

	.tabs-list .count-badge {
		min-width: 1.5rem;
		padding: 0.08rem 0.5rem;
		border-radius: 999px;
		font-size: 0.7rem;
		text-align: center;
		background: rgba(37, 99, 235, 0.22);
		color: #60a5fa;
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
		color: var(--color-text-primary);
		transform: translateY(-1px);
	}

	.tabs-list button:hover::after {
		background: rgba(148, 163, 253, 0.55);
		transform: scaleX(1);
	}

	.tabs-list button.active {
		color: var(--color-text-primary);
	}

	.tabs-list button.active::after {
		background: #3b82f6;
		transform: scaleX(1);
	}

	.header-right {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 0.5rem;
		grid-row: 1;
		grid-column: 1;
		justify-self: end;
	}

	.theme-toggle-wrapper {
		display: inline-flex;
		align-items: flex-start;
		transform: scale(1.2);
		transform-origin: top right;
	}

	.owner-login-button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 0.7rem;
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease,
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	.owner-login-button .dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: #22c55e;
		box-shadow: 0 0 6px rgba(34, 197, 94, 0.9);
	}

	.owner-login-button .label {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 500;
	}

	.owner-login-button:hover {
		color: #9ca3af;
		background: rgba(15, 23, 42, 0.9);
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(15, 23, 42, 0.6);
	}

	@media (min-width: 768px) {
		.header-inner {
			grid-template-columns: auto 1fr auto;
			grid-template-rows: auto;
			gap: 1.75rem;
		}

		.logo-button {
			grid-row: 1;
			grid-column: 1;
		}

		.tabs-nav {
			grid-row: 1;
			grid-column: 2;
		}

		.header-right {
			grid-row: 1;
			grid-column: 3;
			justify-self: auto;
		}
	}

	@media (max-width: 767px) {
		.tabs-list button {
			min-height: 44px;
			padding: 0.5rem 0 0.15rem;
		}
	}
</style>
