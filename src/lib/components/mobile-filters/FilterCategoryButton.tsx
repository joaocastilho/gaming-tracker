import { Monitor, Tag, Trophy, Users } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, Match, Show, Switch } from 'solid-js';
import './FilterCategoryButton.css';

export interface FilterCategoryButtonProps {
	type: 'platforms' | 'genres' | 'tiers' | 'coOp';
	count?: number;
	onClick: () => void;
}

export default function FilterCategoryButton(props: FilterCategoryButtonProps): JSX.Element {
	const count = createMemo(() => props.count ?? 0);

	return (
		<Switch
			fallback={
				<button
					type="button"
					class={['mobile-filter-category-compact', { 'has-selection': count() > 0 }]}
					onClick={() => props.onClick()}
				>
					<Trophy size={14} />
					<span>Tiers</span>
					<Show when={count() > 0}>
						<span class="category-count-small">{count()}</span>
					</Show>
				</button>
			}
		>
			<Match when={props.type === 'coOp'}>
				<button
					type="button"
					class={['mobile-filter-category-compact coop-toggle', { 'has-selection': count() > 0 }]}
					onClick={() => props.onClick()}
				>
					<Users size={14} />
					<span>Co-op</span>
				</button>
			</Match>
			<Match when={props.type === 'platforms'}>
				<button
					type="button"
					class={['mobile-filter-category-compact', { 'has-selection': count() > 0 }]}
					onClick={() => props.onClick()}
				>
					<Monitor size={14} />
					<span>Platforms</span>
					<Show when={count() > 0}>
						<span class="category-count-small">{count()}</span>
					</Show>
				</button>
			</Match>
			<Match when={props.type === 'genres'}>
				<button
					type="button"
					class={['mobile-filter-category-compact', { 'has-selection': count() > 0 }]}
					onClick={() => props.onClick()}
				>
					<Tag size={14} />
					<span>Genres</span>
					<Show when={count() > 0}>
						<span class="category-count-small">{count()}</span>
					</Show>
				</button>
			</Match>
		</Switch>
	);
}
