import { ChevronDown, Monitor, RotateCcw, Tag, Trophy, Users } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import { getCoOpColor, getGenreColor, getPlatformColor, getTierColor } from '#lib/utils/filterOptions.js';
import { getTierDisplayName } from '#lib/utils/tierUtils.js';
import './FilterDropdown.css';

export interface FilterDropdownProps {
	type: 'platforms' | 'genres' | 'tiers' | 'coOp';
	label: string;
	options: string[];
	selectedOptions?: string[];
}

export default function FilterDropdown(props: FilterDropdownProps): JSX.Element {
	const [isOpen, setIsOpen] = createSignal(false);
	const [dropdownEl, setDropdownEl] = createSignal<HTMLDivElement | null>(null);
	const selected = createMemo(() => props.selectedOptions ?? []);

	createEffect(
		() => ({ open: isOpen(), el: dropdownEl() }),
		({ open, el }) => {
			if (!open) return;
			const handleClickOutside = (event: MouseEvent) => {
				if (!(event.target instanceof Node)) return;
				if (el && !el.contains(event.target)) {
					setIsOpen(false);
				}
			};
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	);

	function toggleOption(option: string): void {
		if (props.type === 'platforms') filtersStore.togglePlatform(option);
		else if (props.type === 'genres') filtersStore.toggleGenre(option);
		else if (props.type === 'tiers') filtersStore.toggleTier(option);
		else if (props.type === 'coOp') filtersStore.toggleCoOp(option);
	}

	function selectAll(): void {
		selected().forEach((option) => {
			if (props.type === 'platforms') filtersStore.removePlatform(option);
			else if (props.type === 'genres') filtersStore.removeGenre(option);
			else if (props.type === 'tiers') filtersStore.removeTier(option);
			else if (props.type === 'coOp') filtersStore.removeCoOp(option);
		});
	}

	function getOptionColor(option: string): string {
		if (props.type === 'platforms') return getPlatformColor(option);
		if (props.type === 'genres') return getGenreColor(option);
		if (props.type === 'tiers') return getTierColor(option);
		if (props.type === 'coOp') return getCoOpColor(option);
		return 'bg-gray-600 text-white';
	}

	function getButtonColorClasses(): string {
		return selected().length === 0
			? 'bg-surface hover:bg-accent hover:text-accent-foreground border-0'
			: 'bg-accent text-accent-foreground border-0';
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			setIsOpen(false);
			event.preventDefault();
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			setIsOpen((o) => !o);
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
		}
	}

	return (
		<div class="filter-dropdown" ref={setDropdownEl}>
			<button
				type="button"
				class={[
					'filter-button flex items-center gap-2 rounded-md py-2 text-sm transition-colors',
					getButtonColorClasses(),
					{ selected: selected().length > 0 },
				]}
				onClick={() => setIsOpen((o) => !o)}
				onKeyDown={handleKeydown}
				aria-expanded={isOpen() ? 'true' : 'false'}
				aria-haspopup="listbox"
				aria-label={`Filter by ${props.label.toLowerCase()}`}
			>
				<Switch>
					<Match when={props.type === 'platforms'}>
						<Monitor size={16} class="text-gray-600 dark:text-gray-400" />
					</Match>
					<Match when={props.type === 'genres'}>
						<Tag size={16} class="text-gray-600 dark:text-gray-400" />
					</Match>
					<Match when={props.type === 'tiers'}>
						<Trophy size={16} class="text-gray-600 dark:text-gray-400" />
					</Match>
					<Match when={props.type === 'coOp'}>
						<Users size={16} class="text-gray-600 dark:text-gray-400" />
					</Match>
				</Switch>
				<span class="filter-label">{props.label}</span>
				<ChevronDown
					size={16}
					class="dropdown-arrow text-gray-600 transition-transform duration-200 dark:text-gray-400"
				/>
				<Show when={selected().length > 0}>
					<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs">
						{selected().length}
					</span>
				</Show>
			</button>

			<Show when={isOpen()}>
				<div class="filter-options-dropdown" role="listbox" aria-label={props.label.toLowerCase()}>
					<div class="filter-options-section">
						<div class="filter-options-grid">
							<For each={props.options}>
								{(option) => (
									<button
										type="button"
										role="option"
										aria-selected={selected().includes(option) ? 'true' : 'false'}
										class={[
											'badge filter-option-item',
											getOptionColor(option),
											{ selected: selected().includes(option) },
										]}
										onClick={() => toggleOption(option)}
									>
										{props.type === 'tiers' ? getTierDisplayName(option) : option}
									</button>
								)}
							</For>
						</div>

						<Show when={selected().length > 0}>
							<div class="filter-actions mt-3 flex justify-center">
								<button
									type="button"
									class="flex cursor-pointer items-center gap-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
									onClick={(event) => {
										event.stopPropagation();
										selectAll();
									}}
									aria-label="Clear all filters"
									title="Clear all"
								>
									<RotateCcw size={18} />
								</button>
							</div>
						</Show>

						<Show when={props.options.length === 0}>
							<div class="empty-state py-2 text-center">
								<span class="text-muted-foreground text-sm">No {props.label.toLowerCase()} available</span>
							</div>
						</Show>
					</div>
				</div>
			</Show>
		</div>
	);
}
