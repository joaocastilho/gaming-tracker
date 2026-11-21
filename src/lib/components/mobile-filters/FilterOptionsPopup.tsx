import { Monitor, Tag, Trophy } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, For, Match, Switch } from 'solid-js';
import { getGenreColor, getPlatformColor, getTierColor } from '#lib/utils/filterOptions.js';
import './FilterOptionsPopup.css';

export interface FilterOption {
	value: string;
	colorClass?: string;
}

export interface FilterOptionsPopupProps {
	type: 'platforms' | 'genres' | 'tiers';
	options: FilterOption[];
	selected: string[];
	onToggle: (value: string) => void;
	onReset: () => void;
	onClose: () => void;
	onAccept: (closeAll?: boolean) => void;
}

const COLORS = {
	platforms: getPlatformColor,
	genres: getGenreColor,
	tiers: getTierColor,
};

export default function FilterOptionsPopup(props: FilterOptionsPopupProps): JSX.Element {
	const colorFn = createMemo(() => COLORS[props.type]);

	function handleBackdropClick(e: MouseEvent): void {
		const target = e.target;
		if (target instanceof HTMLElement && target.classList.contains('bg-black/60')) {
			props.onAccept(true);
		}
	}

	return (
		<div
			class="filter-popup-overlay fixed inset-0 z-[60] flex items-center justify-center md:hidden"
			role="dialog"
			tabindex="-1"
			onKeyDown={(e) => {
				if (e.key === 'Escape') props.onAccept(true);
			}}
			onClick={handleBackdropClick}
		>
			<button
				type="button"
				class="absolute inset-0 border-0 bg-black/60 p-0 backdrop-blur-sm"
				onClick={() => props.onClose()}
				aria-label="Apply and close popup"
			/>
			<div class="filter-popup-content">
				<div class="filter-popup-header">
					<h3 class="filter-popup-title">
						<Switch
							fallback={
								<>
									<Trophy size={18} /> Tiers
								</>
							}
						>
							<Match when={props.type === 'platforms'}>
								<Monitor size={18} /> Platforms
							</Match>
							<Match when={props.type === 'genres'}>
								<Tag size={18} /> Genres
							</Match>
						</Switch>
					</h3>
					<div class="filter-popup-header-actions">
						<button
							type="button"
							class="popup-icon-btn reset"
							onClick={() => props.onReset()}
							aria-label="Reset this filter"
							title="Reset"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
								<path d="M3 3v5h5" />
							</svg>
						</button>
						<button
							type="button"
							class="popup-icon-btn accept"
							onClick={() => props.onAccept()}
							aria-label="Accept selection"
							title="Accept"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</button>
					</div>
				</div>
				<div class="filter-popup-options">
					<For each={props.options}>
						{(option) => (
							<button
								type="button"
								class={[
									'themed-filter-pill',
									colorFn()(option.value),
									{ selected: props.selected.includes(option.value) },
								]}
								onClick={() => props.onToggle(option.value)}
							>
								{option.value}
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	);
}
