<script lang="ts">
	import { navigateTo, navigateToAndReset } from '$lib/utils/navigationUtils';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	import { appStore } from '$lib/stores/app.svelte';
	import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist';

	type NavItem = {
		id: NavId;
		label: string;
		route: string;
		count: number | null;
		active: boolean;
	};

	// Use $derived to reactively compute navItems whenever activeTab or counts change
	let navItems = $derived.by(() => {
		const counts = filteredCountsStore.counts;
		const currentTab = appStore.activeTab;

		return [
			{
				id: 'all' as NavId,
				label: 'Games',
				route: '/',
				count: counts.all,
				active: currentTab === 'all'
			},
			{
				id: 'completed' as NavId,
				label: 'Completed',
				route: '/completed',
				count: counts.completed,
				active: currentTab === 'completed'
			},
			{
				id: 'planned' as NavId,
				label: 'Planned',
				route: '/planned',
				count: counts.planned,
				active: currentTab === 'planned'
			},
			{
				id: 'tierlist' as NavId,
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: currentTab === 'tierlist'
			}
		] as NavItem[];
	});

	async function handleNavClick(target: NavId) {
		if (target === 'tierlist') {
			await navigateToAndReset(target);
		} else {
			await navigateTo(target);
		}
	}
</script>

<header class="header-root px-6 py-3 md:py-1">
	<div class="header-inner container mx-auto">
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
		</div>
	</div>
</header>

<style>
	.header-root {
		padding: 0.75rem 16px;
	}

	.header-inner {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto;
		gap: 1rem;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		align-items: center;
	}

	.tabs-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		grid-column: 1;
	}

	.tabs-list {
		display: inline-flex;
		align-items: center;
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
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		grid-row: 1;
		grid-column: 2;
	}

	.theme-toggle-wrapper {
		display: inline-flex;
		align-items: center;
		transform: scale(1.2);
		transform-origin: center right;
	}

	@media (max-width: 834px) {
		.tabs-list button {
			min-height: 44px;
			padding: 0.5rem 0 0.15rem;
		}

		.tabs-nav {
			display: none;
		}

		.header-inner {
			grid-template-columns: 1fr auto;
			justify-content: space-between;
		}

		.header-root {
			padding: 0.75rem 1.8rem;
		}

		.header-right {
			grid-row: 1;
			grid-column: 2;
		}

		.theme-toggle-wrapper {
			transform: none;
		}
	}
</style>
