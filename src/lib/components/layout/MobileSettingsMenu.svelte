<script lang="ts">
import { appStore } from '$lib/stores/app.svelte';
import { editorStore } from '$lib/stores/editor.svelte';
import { SlidersHorizontal, Settings, Moon, Sun, LogIn, LogOut, Plus, Download, Share } from 'lucide-svelte';
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
	isTierlistPage: _isTierlistPage,
	onToggle,
	onClose,
	onFiltersToggle,
	onAddGame,
	onOpenLogin,
	canInstall = false,
	onInstall = () => {},
}: Props = $props();

let isEditor = $derived(editorStore.editorMode);

const buildDate = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
}).format(new Date(__BUILD_DATE__));
</script>

<div class="mobile-settings-container md:hidden">
	<button
		type="button"
		class="floating-action-button filter-fab"
		onclick={onFiltersToggle}
		aria-label="Open filters"
		title="Filters"
	>
		<SlidersHorizontal size={20} />
	</button>

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
					if (navigator.share) {
						navigator.share({
							title: 'Gaming Tracker',
							url: '/',
						});
					} else {
						navigator.clipboard.writeText(window.location.origin + '/');
						alert('Link copied to clipboard!');
					}
					onClose();
				}}
			>
				<Share size={20} />
				<span>Share</span>
			</button>

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

				{#if isEditor}
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
				<div class="mt-2 text-center text-xs text-neutral-500">
					Last Update: {buildDate}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
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
		background: rgba(75, 85, 99, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		opacity: 0.8;
	}

	.settings-fab:hover {
		background: rgba(75, 85, 99, 0.6);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
		opacity: 1;
	}

	.settings-fab.active {
		background: rgba(75, 85, 99, 0.7);
		opacity: 1;
	}

	:global(.light) .settings-fab {
		background: rgba(184, 169, 154, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 0 4px 12px rgba(61, 53, 48, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.05);
		color: #1c1917;
		opacity: 0.8;
	}

	:global(.light) .settings-fab:hover {
		background: rgba(184, 169, 154, 0.6);
		box-shadow: 0 6px 16px rgba(61, 53, 48, 0.2);
		opacity: 1;
	}

	:global(.light) .settings-fab.active {
		background: rgba(184, 169, 154, 0.7);
	}

	.settings-fab :global(.settings-icon) {
		transition: transform 0.2s ease;
	}

	.settings-fab.active :global(.settings-icon) {
		transform: rotate(90deg);
	}

	.filter-fab {
		background: rgba(99, 102, 241, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		opacity: 0.8;
	}

	.filter-fab:hover {
		background: rgba(99, 102, 241, 0.6);
		box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
		opacity: 1;
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
		background-color: rgba(99, 102, 241, 0.03);
	}

	:global(.light) .sheet-item:hover {
		background-color: rgba(234, 88, 12, 0.03);
	}

	.sheet-item:active {
		transform: scale(0.98);
	}

	.sheet-item-green {
		color: #22c55e;
	}

	.sheet-item-green:hover {
		background-color: rgba(34, 197, 94, 0.04);
	}

	.sheet-item-red {
		color: #ef4444;
	}

	.sheet-item-red:hover {
		background-color: rgba(239, 68, 68, 0.04);
	}

	.sheet-item-blue {
		color: var(--color-accent);
	}

	.sheet-item-blue:hover {
		background-color: rgba(99, 102, 241, 0.03);
	}

	:global(.light) .sheet-item-blue:hover {
		background-color: rgba(234, 88, 12, 0.03);
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
