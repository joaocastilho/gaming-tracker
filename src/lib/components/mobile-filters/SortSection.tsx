import { ArrowUpDown } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import RatingsSort from '#lib/components/RatingsSort.js';
import './FilterSection.css';

export default function SortSection(): JSX.Element {
	return (
		<div class="mobile-filter-section">
			<h3 class="mobile-filter-section-title">
				<ArrowUpDown size={16} class="section-icon" />
				Sort By
			</h3>
			<div class="mobile-sort-options">
				<RatingsSort />
			</div>
		</div>
	);
}
