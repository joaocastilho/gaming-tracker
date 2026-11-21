import { SlidersHorizontal } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import FilterCategoryButton from './FilterCategoryButton.js';
import './FilterSection.css';

export interface FilterSectionProps {
	showTiersFilter?: boolean;
	showCoOpFilter?: boolean;
	platformCount?: number;
	genreCount?: number;
	tierCount?: number;
	coOpSelected?: boolean;
	onPlatformClick: () => void;
	onGenreClick: () => void;
	onTierClick: () => void;
	onCoOpClick: () => void;
}

export default function FilterSection(props: FilterSectionProps): JSX.Element {
	return (
		<div class="mobile-filter-section">
			<h3 class="mobile-filter-section-title">
				<SlidersHorizontal size={16} class="section-icon" />
				Filter By
			</h3>
			<div class="mobile-filter-categories-compact">
				<FilterCategoryButton type="platforms" count={props.platformCount ?? 0} onClick={props.onPlatformClick} />
				<FilterCategoryButton type="genres" count={props.genreCount ?? 0} onClick={props.onGenreClick} />
				<Show when={props.showTiersFilter !== false}>
					<FilterCategoryButton type="tiers" count={props.tierCount ?? 0} onClick={props.onTierClick} />
				</Show>
				<Show when={props.showCoOpFilter !== false}>
					<FilterCategoryButton type="coOp" count={props.coOpSelected ? 1 : 0} onClick={props.onCoOpClick} />
				</Show>
			</div>
		</div>
	);
}
