import {
	Check,
	Download,
	LogIn,
	LogOut,
	Moon,
	Plus,
	RotateCcw,
	Settings,
	Share,
	SlidersHorizontal,
	Sun,
} from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, onSettled, Show } from 'solid-js';
import { appStore } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { filtersStore } from '#lib/stores/filters.js';
import { focusTrap } from '#lib/utils/focusTrap.js';
import { createShareData } from '#lib/utils/share.js';
import './MobileSettingsMenu.css';

export interface MobileSettingsMenuProps {
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

const buildDate = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
}).format(new Date(__BUILD_DATE__));

function isShareCancellation(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError';
}

export default function MobileSettingsMenu(props: MobileSettingsMenuProps): JSX.Element {
	const [sheetEl, setSheetEl] = createSignal<HTMLDivElement | null>(null);
	const [linkCopied, setLinkCopied] = createSignal(false);
	let copiedTimer: ReturnType<typeof setTimeout> | null = null;
	const hasActiveFilters = createMemo(() => filtersStore.isAnyFilterApplied() || filtersStore.isSortModified());

	onSettled(() => () => {
		if (copiedTimer) clearTimeout(copiedTimer);
	});

	createEffect(
		() => ({ open: props.isOpen, el: sheetEl() }),
		({ open, el }) => {
			if (!open) {
				setLinkCopied(false);
				if (copiedTimer) {
					clearTimeout(copiedTimer);
					copiedTimer = null;
				}
				return;
			}
			if (!el) return;
			const trap = focusTrap(el);
			return () => trap.destroy();
		}
	);

	function handleResetFilters(): void {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
	}

	async function handleShare(): Promise<void> {
		const shareData = createShareData(window.location.href, document.title);

		try {
			if (navigator.share) {
				await navigator.share(shareData);
				props.onClose();
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(shareData.url);
				setLinkCopied(true);
				if (copiedTimer) clearTimeout(copiedTimer);
				copiedTimer = setTimeout(() => {
					setLinkCopied(false);
					copiedTimer = null;
					props.onClose();
				}, 1200);
			}
		} catch (error: unknown) {
			if (isShareCancellation(error)) return;
		}
	}

	return (
		<>
			<div class="mobile-settings-container md:hidden">
				<Show when={hasActiveFilters()}>
					<button
						type="button"
						class="floating-action-button reset-fab"
						onClick={handleResetFilters}
						aria-label="Reset filters"
						title="Reset Filters"
					>
						<RotateCcw size={20} />
					</button>
				</Show>

				<button
					type="button"
					class="floating-action-button filter-fab"
					onClick={() => props.onFiltersToggle()}
					aria-label="Open filters"
					title="Filters"
				>
					<SlidersHorizontal size={20} />
				</button>

				<button
					type="button"
					class={['floating-action-button settings-fab', { active: props.isOpen }]}
					onClick={() => props.onToggle()}
					aria-label={props.isOpen ? 'Close settings' : 'Open settings'}
					aria-expanded={props.isOpen ? 'true' : 'false'}
					title="Settings"
				>
					<Settings size={20} class="settings-icon" />
				</button>
			</div>

			<Show when={props.isOpen}>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: bottom sheet backdrop dismisses on click */}
				<div
					class="settings-bottom-sheet-overlay md:hidden"
					onClick={() => props.onClose()}
					onKeyDown={(e) => e.key === 'Escape' && props.onClose()}
					role="presentation"
					tabindex="-1"
				>
					<div
						ref={setSheetEl}
						class="settings-bottom-sheet"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={() => {}}
						role="dialog"
						aria-modal="true"
						aria-label="Settings"
						tabindex="-1"
					>
						<div class="sheet-handle" />
						<div class="sheet-content">
							<Show when={props.canInstall}>
								<button
									type="button"
									class="sheet-item sheet-item-blue"
									onClick={() => {
										props.onClose();
										props.onInstall?.();
									}}
								>
									<Download size={20} />
									<span>Install App</span>
								</button>
							</Show>

							<button type="button" class="sheet-item" onClick={() => void handleShare()}>
								<Show when={linkCopied()} fallback={<Share size={20} />}>
									<Check size={20} />
								</Show>
								<span>{linkCopied() ? 'Link copied!' : 'Share'}</span>
							</button>

							<button
								type="button"
								class="sheet-item"
								onClick={() => {
									appStore.toggleTheme();
									props.onClose();
								}}
							>
								<Show when={appStore.theme === 'dark'} fallback={<Moon size={20} />}>
									<Sun size={20} />
								</Show>
								<span>{appStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
							</button>

							<Show when={editorStore.editorMode}>
								<button
									type="button"
									class="sheet-item sheet-item-green"
									onClick={() => {
										props.onClose();
										props.onAddGame();
									}}
								>
									<Plus size={20} />
									<span>Add Game</span>
								</button>
							</Show>

							<Show
								when={editorStore.editorMode}
								fallback={
									<button
										type="button"
										class="sheet-item sheet-item-blue"
										onClick={() => {
											props.onClose();
											props.onOpenLogin();
										}}
									>
										<LogIn size={20} />
										<span>Login</span>
									</button>
								}
							>
								<button
									type="button"
									class="sheet-item sheet-item-red"
									onClick={async () => {
										props.onClose();
										await editorStore.logout();
									}}
								>
									<LogOut size={20} />
									<span>Logout</span>
								</button>
							</Show>

							<div class="mt-2 text-center text-xs text-neutral-500">Last Update: {buildDate}</div>
						</div>
					</div>
				</div>
			</Show>
		</>
	);
}
