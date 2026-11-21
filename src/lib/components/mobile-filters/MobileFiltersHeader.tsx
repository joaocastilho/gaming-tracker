import { ChevronDown, RotateCcw } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import './MobileFiltersHeader.css';

export interface MobileFiltersHeaderProps {
	title?: string;
	onReset: () => void;
	onClose: () => void;
}

export default function MobileFiltersHeader(props: MobileFiltersHeaderProps): JSX.Element {
	const canReset = createMemo(() => filtersStore.isAnyFilterApplied() || filtersStore.isSortModified());

	return (
		<div class="mobile-filters-header">
			<h2 class="mobile-filters-title">{props.title ?? 'Filters and Sorting'}</h2>
			<div class="mobile-filters-actions">
				<button
					type="button"
					class={['mobile-header-icon reset-icon', { 'is-active': canReset() }]}
					onClick={() => props.onReset()}
					aria-label="Reset all filters"
					title="Reset"
				>
					<RotateCcw size={18} />
				</button>
				<button
					type="button"
					class="mobile-header-icon collapse-icon"
					onClick={() => props.onClose()}
					aria-label="Collapse filters pane"
					title="Collapse"
				>
					<ChevronDown size={20} />
				</button>
			</div>
		</div>
	);
}
