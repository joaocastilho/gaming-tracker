import type { JSX } from '@solidjs/web';
import { For } from 'solid-js';
import './SkeletonGrid.css';

const SKELETON_INDICES = Array.from({ length: 20 }, (_, i) => i);

export default function SkeletonGrid(): JSX.Element {
	return (
		<div class="skeleton-wrapper">
			<div class="skeleton-grid">
				<For each={SKELETON_INDICES}>
					{() => (
						<div class="skeleton-card">
							<div class="skeleton-cover" />
							<div class="skeleton-info">
								<div class="skeleton-title" />
								<div class="skeleton-meta" />
								<div class="skeleton-score" />
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
