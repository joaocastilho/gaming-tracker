import type { JSX } from '@solidjs/web';
import { Repeat } from 'solid-js';
import './SkeletonGrid.css';

export default function SkeletonGrid(): JSX.Element {
	return (
		<div class="skeleton-wrapper">
			<div class="skeleton-grid">
				<Repeat count={20}>
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
				</Repeat>
			</div>
		</div>
	);
}
