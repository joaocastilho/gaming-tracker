<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import {
		SlidersHorizontal,
		Settings,
		Moon,
		Sun,
		LogIn,
		LogOut,
		Plus,
		Download
	} from 'lucide-svelte';
	import { focusTrap } from '$lib/utils/focusTrap';

	interface Props {
		isOpen: boolean;
		isTierlistPage: boolean;
		onToggle: () => void;
		onClose: () => void;
		onFiltersToggle: () => void;
		onAddGame: () => void;
		onOpenLogin: () => void;
		canInstall?: boolean;
		onInstall?: () => void;
	}

	let {
		isOpen,
		isTierlistPage,
		onToggle,
		onClose,
		onFiltersToggle,
		onAddGame,
		onOpenLogin,
		canInstall = false,
		onInstall = () => {}
	}: Props = $props();

	let isEditor = $derived(editorStore.editorMode);
</script>

<div class="mobile-settings-container md:hidden">
	<!-- Filter button - prominent, always visible (not on tierlist) -->
	{#if !isTierlistPage}
		<button
			type="button"
			class="floating-action-button filter-fab"
			onclick={onFiltersToggle}
			aria-label="Open filters"
			title="Filters"
		>
			<SlidersHorizontal size={20} />
		</button>
	{/if}

	<!-- Main Settings FAB -->
	<button
		type="button"
		class="floating-action-button settings-fab"
		class:active={isOpen}
		onclick={onToggle}
		aria-label={isOpen ? 'Close settings' : 'Open settings'}
		aria-expanded={isOpen}
		title="Settings"
	>
		<Settings size={20} class="settings-icon" />
	</button>
</div>

<!-- Settings Bottom Sheet -->
{#if isOpen}
	<div
		class="settings-bottom-sheet-overlay md:hidden"
		onclick={onClose}
		onkeydown={(e: KeyboardEvent) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
	>
		<div
			class="settings-bottom-sheet"
			onclick={(e: Event) => e.stopPropagation()}
			onkeydown={() => {}}
			role="dialog"
			aria-modal="true"
			aria-label="Settings"
			tabindex="-1"
			use:focusTrap
		>
			<div class="sheet-handle"></div>
			<div class="sheet-content">
				{#if canInstall}
					<button
						type="button"
						class="sheet-item sheet-item-blue"
						onclick={() => {
							onClose();
							onInstall();
						}}
					>
						<Download size={20} />
						<span>Install App</span>
					</button>
				{/if}

				<button
					type="button"
					class="sheet-item"
					onclick={() => {
						appStore.toggleTheme();
						onClose();
					}}
				>
					{#if appStore.theme === 'dark'}
						<Sun size={20} />
					{:else}
						<Moon size={20} />
					{/if}
					<span>{appStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
				</button>

				{#if isEditor && !isTierlistPage}
					<button
						type="button"
						class="sheet-item sheet-item-green"
						onclick={() => {
							onClose();
							onAddGame();
						}}
					>
						<Plus size={20} />
						<span>Add Game</span>
					</button>
				{/if}

				{#if isEditor}
					<button
						type="button"
						class="sheet-item sheet-item-red"
						onclick={async () => {
							onClose();
							await editorStore.logout();
						}}
					>
						<LogOut size={20} />
						<span>Logout</span>
					</button>
				{:else}
					<button
						type="button"
						class="sheet-item sheet-item-blue"
						onclick={() => {
							onClose();
							onOpenLogin();
						}}
					>
						<LogIn size={20} />
						<span>Login</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Mobile Settings Menu */
	.mobile-settings-container {
		position: fixed;
		right: 16px;
		bottom: calc(86px + env(safe-area-inset-bottom, 0px));
		z-index: 45;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	@media (min-width: 768px) {
		.mobile-settings-container {
			display: none;
		}
	}

	.floating-action-button {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		outline: none;
	}

	.floating-action-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
	}

	.floating-action-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.floating-action-button:focus {
		outline: none;
	}

	/* Settings FAB */
	.settings-fab {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		border: none;
		color: white;
		opacity: 0.7;
	}

	.settings-fab:hover {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		opacity: 0.9;
	}

	.settings-fab.active {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		opacity: 0.9;
	}

	/* Light theme variations for settings FAB */
	:global(.light) .settings-fab {
		background: linear-gradient(135deg, #b8a99a 0%, #9c8b7a 100%);
		box-shadow: 0 4px 12px rgba(61, 53, 48, 0.15);
		opacity: 0.8;
	}

	:global(.light) .settings-fab:hover {
		background: linear-gradient(135deg, #9c8b7a 0%, #8a7a6a 100%);
		box-shadow: 0 6px 16px rgba(61, 53, 48, 0.25);
		opacity: 0.95;
	}

	:global(.light) .settings-fab.active {
		background: linear-gradient(135deg, #9c8b7a 0%, #8a7a6a 100%);
	}

	.settings-fab :global(.settings-icon) {
		transition: transform 0.2s ease;
	}

	.settings-fab.active :global(.settings-icon) {
		transform: rotate(90deg);
	}

	/* Filter FAB */
	.filter-fab {
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
		border: none;
		color: var(--color-accent-foreground);
	}

	.filter-fab:hover {
		background: linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%);
		box-shadow: var(--shadow-glow);
	}

	/* Settings Bottom Sheet */
	.settings-bottom-sheet-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		animation: fadeIn 0.15s ease-out;
	}

	.settings-bottom-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-background);
		border-radius: 20px 20px 0 0;
		padding: 8px 16px 24px;
		padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
		animation: slideUp 0.2s cubic-bezier(0.32, 0.72, 0, 1);
		z-index: 61;
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
	}

	.sheet-handle {
		width: 36px;
		height: 4px;
		background-color: var(--color-border);
		border-radius: 2px;
		margin: 8px auto 16px;
	}

	.sheet-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.sheet-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 12px;
		border: none;
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.12s ease-out;
		text-align: left;
	}

	.sheet-item:hover {
		background-color: var(--color-hover);
	}

	.sheet-item:active {
		transform: scale(0.98);
	}

	.sheet-item-green {
		color: #22c55e;
	}

	.sheet-item-green:hover {
		background-color: rgba(34, 197, 94, 0.15);
	}

	.sheet-item-red {
		color: #ef4444;
	}

	.sheet-item-red:hover {
		background-color: rgba(239, 68, 68, 0.15);
	}

	.sheet-item-blue {
		color: var(--color-accent);
	}

	.sheet-item-blue:hover {
		background-color: var(--color-hover);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@media (max-width: 480px) {
		.mobile-settings-container {
			right: 16px;
			bottom: calc(90px + env(safe-area-inset-bottom, 0px));
		}

		.floating-action-button {
			width: 44px;
			height: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.floating-action-button,
		.settings-bottom-sheet,
		.settings-bottom-sheet-overlay {
			transition: none;
			animation: none;
		}
	}
</style>
