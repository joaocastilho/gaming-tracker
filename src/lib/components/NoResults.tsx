import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import './NoResults.css';

export interface NoResultsProps {
	message?: string;
	description?: string;
	onReset?: () => void;
}

export default function NoResults(props: NoResultsProps): JSX.Element {
	return (
		<div class="no-results-container flex w-full flex-col items-center justify-center px-4 py-16">
			<div class="empty-state-card animate-fade-in-up flex w-full max-w-md flex-col items-center gap-6">
				<div class="icon-wrapper bg-surface-elevated border-border flex items-center justify-center rounded-2xl border shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--color-accent)"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="opacity-100"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M16 16s-1.5-2-4-2-4 2-4 2" />
						<line x1="9" y1="9" x2="9.01" y2="9" />
						<line x1="15" y1="9" x2="15.01" y2="9" />
					</svg>
				</div>

				<div class="text-content space-y-3 text-center">
					<h2 class="message-title text-2xl font-semibold tracking-tight">
						{props.message ?? 'No games match your filters'}
					</h2>
					<p class="description-text leading-relaxed font-medium">
						{props.description ?? 'Try adjusting your selection or clearing all filters to see more results.'}
					</p>
				</div>

				<Show when={props.onReset}>
					{(resetFn) => (
						<button
							type="button"
							class="clear-filters-btn group hover:shadow-glow relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
							onClick={() => resetFn()()}
							aria-label="Clear all filters"
						>
							<span class="relative z-10 flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
									<path d="M3 3v5h5" />
								</svg>
								Clear all filters
							</span>
							<div class="absolute inset-0 z-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
						</button>
					)}
				</Show>
			</div>
		</div>
	);
}
