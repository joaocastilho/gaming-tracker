import {
	AArrowDown,
	ArrowDown,
	ArrowUp,
	Award,
	Calendar,
	Clock,
	Gamepad2,
	NotebookPen,
	Presentation,
	Timer,
} from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, Show } from 'solid-js';
import { appStore } from '#lib/stores/app.js';
import { filtersStore, type SortKey } from '#lib/stores/filters.js';
import './RatingsSort.css';

export default function RatingsSort(): JSX.Element {
	const sortOption = createMemo(() => filtersStore.state?.sortOption ?? null);
	const currentTab = createMemo(() => appStore.activeTab);
	const activeKey = createMemo(
		() => sortOption()?.key ?? (currentTab() === 'completed' ? 'finishedDate' : 'alphabetical')
	);
	const activeDirection = createMemo(() => sortOption()?.direction ?? (currentTab() === 'completed' ? 'desc' : 'asc'));

	function handleSort(key: SortKey): void {
		if (activeKey() === key) {
			const newDirection = activeDirection() === 'asc' ? 'desc' : 'asc';
			filtersStore.setSort({ key, direction: newDirection });
		} else {
			const direction = key === 'alphabetical' ? 'asc' : 'desc';
			filtersStore.setSort({ key, direction });
		}
	}

	return (
		<div class="ratings-sort">
			<button
				type="button"
				class={['sort-button', { active: activeKey() === 'alphabetical' }]}
				onClick={() => handleSort('alphabetical')}
				aria-label="Sort Alphabetically"
			>
				<AArrowDown class="sort-icon text-gray-500" aria-hidden="true" />
				<span class="sort-field-label">Alphabetical</span>
				<Show when={activeKey() === 'alphabetical'}>
					<Show when={activeDirection() === 'asc'} fallback={<ArrowUp size={14} class="sort-direction-icon" />}>
						<ArrowDown size={14} class="sort-direction-icon" />
					</Show>
				</Show>
			</button>

			<Show when={currentTab() !== 'planned'}>
				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'presentation' }]}
					onClick={() => handleSort('presentation')}
					aria-label="Sort by Presentation"
				>
					<Presentation class="sort-icon text-rose-500" aria-hidden="true" />
					<span class="sort-field-label">Presentation</span>
					<Show when={activeKey() === 'presentation'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>

				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'story' }]}
					onClick={() => handleSort('story')}
					aria-label="Sort by Story"
				>
					<NotebookPen class="sort-icon text-sky-500" aria-hidden="true" />
					<span class="sort-field-label">Story</span>
					<Show when={activeKey() === 'story'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>

				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'gameplay' }]}
					onClick={() => handleSort('gameplay')}
					aria-label="Sort by Gameplay"
				>
					<Gamepad2 class="sort-icon text-emerald-500" aria-hidden="true" />
					<span class="sort-field-label">Gameplay</span>
					<Show when={activeKey() === 'gameplay'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>

				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'score' }]}
					onClick={() => handleSort('score')}
					aria-label="Sort by Score"
				>
					<Award class="sort-icon text-yellow-400" aria-hidden="true" />
					<span class="sort-field-label">Score</span>
					<Show when={activeKey() === 'score'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>

				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'finishedDate' }]}
					onClick={() => handleSort('finishedDate')}
					aria-label="Sort by Finishing Date"
				>
					<Calendar class="sort-icon text-green-500" aria-hidden="true" />
					<span class="sort-field-label">Finished Date</span>
					<Show when={activeKey() === 'finishedDate'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>
			</Show>

			<Show when={currentTab() === 'completed' || currentTab() === 'planned'}>
				<button
					type="button"
					class={['sort-button', { active: activeKey() === 'playtime' }]}
					onClick={() => handleSort('playtime')}
					aria-label={`Sort by ${currentTab() === 'completed' ? 'Hours Played' : 'Time to Beat'}`}
				>
					<Show
						when={currentTab() === 'completed'}
						fallback={
							<>
								<Timer class="sort-icon text-orange-500" aria-hidden="true" />
								<span class="sort-field-label">Time to Beat</span>
							</>
						}
					>
						<Clock class="sort-icon text-purple-500" aria-hidden="true" />
						<span class="sort-field-label">Hours Played</span>
					</Show>
					<Show when={activeKey() === 'playtime'}>
						<Show when={activeDirection() === 'asc'} fallback={<ArrowDown size={14} class="sort-direction-icon" />}>
							<ArrowUp size={14} class="sort-direction-icon" />
						</Show>
					</Show>
				</button>
			</Show>
		</div>
	);
}
