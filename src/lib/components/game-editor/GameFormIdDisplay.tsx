import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import './GameFormIdDisplay.css';

export interface GameFormIdDisplayProps {
	gameId: string;
	onCopy: () => void;
	copied: boolean;
}

export default function GameFormIdDisplay(props: GameFormIdDisplayProps): JSX.Element {
	return (
		<div class="full cover-path">
			<span class="label-text">Game ID</span>
			<button
				type="button"
				class="read-only-field copyable large-id"
				onClick={() => props.onCopy()}
				title="Click to copy ID"
			>
				<Show
					when={props.copied}
					fallback={
						<>
							<span>{props.gameId || '(Auto-generated)'}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon-copy"
								aria-hidden="true"
							>
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
						</>
					}
				>
					<span style={{ color: '#4ade80', 'font-weight': '600' }}>Copied!</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#4ade80"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</Show>
			</button>
		</div>
	);
}
