import { Calendar, Clock, Flag, Users } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import { getGenreClasses, getPlatformClasses } from '#lib/utils/colorConstants.js';
import { formatDate } from '#lib/utils/dateUtils.js';
import './ModalMetadata.css';

export interface ModalMetadataProps {
	game: Game;
}

export default function ModalMetadata(props: ModalMetadataProps): JSX.Element {
	return (
		<>
			<div class="metadata-badge-row mb-6 flex items-center justify-start md:mb-4">
				<div class="flex flex-wrap gap-2">
					<span
						class={[
							'badge rounded-md px-3 py-1.5 text-sm font-medium md:text-sm',
							getPlatformClasses(props.game.platform),
						]}
					>
						{props.game.platform}
					</span>
					<span
						class={['badge rounded-md px-3 py-1.5 text-sm font-medium md:text-sm', getGenreClasses(props.game.genre)]}
					>
						{props.game.genre}
					</span>
					<Show when={props.game.coOp === 'Yes'}>
						<div
							class="flex items-center justify-center rounded-md bg-blue-500/10 px-2 text-blue-500 dark:text-blue-400"
							title="Co-op Available"
						>
							<Users size={18} />
						</div>
					</Show>
				</div>
			</div>

			<div class="metadata-grid mb-4 grid grid-cols-2 gap-4 md:mb-6 md:gap-4">
				<div class="metadata-item">
					<div
						class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
						style={{ color: 'var(--color-text-tertiary)' }}
					>
						Finished Date
					</div>
					<div
						class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
						style={{ color: 'var(--color-text-primary)' }}
					>
						<Flag size={16} class="landscape-icon hidden" />
						{props.game.finishedDate ? formatDate(props.game.finishedDate) : '-'}
					</div>
				</div>

				<div class="metadata-item flex flex-col items-end">
					<div
						class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
						style={{ color: 'var(--color-text-tertiary)' }}
					>
						Year
					</div>
					<div
						class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
						style={{ color: 'var(--color-text-primary)' }}
					>
						<Calendar size={16} class="landscape-icon hidden" />
						{props.game.year}
					</div>
				</div>

				<Show
					when={props.game.status === 'Completed'}
					fallback={
						<div class="metadata-item">
							<div
								class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
								style={{ color: 'var(--color-text-tertiary)' }}
							>
								Time to Beat
							</div>
							<div
								class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
								style={{ color: 'var(--color-text-primary)' }}
							>
								<Clock size={16} class="landscape-icon hidden" />
								{props.game.playtime || '-'}
							</div>
						</div>
					}
				>
					<div class="metadata-item">
						<div
							class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
							style={{ color: 'var(--color-text-tertiary)' }}
						>
							Hours Played
						</div>
						<div
							class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
							style={{ color: 'var(--color-text-primary)' }}
						>
							<Clock size={16} class="landscape-icon hidden" />
							{props.game.playtime}
						</div>
					</div>
				</Show>
			</div>
		</>
	);
}
