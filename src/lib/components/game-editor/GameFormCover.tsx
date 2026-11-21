import { Image, X } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import './GameFormCover.css';

export interface GameFormCoverProps {
	coverUrl: string;
	coverPreview: string | null;
	coverError: string | null;
	onUrlChange: (url: string) => void;
	onFileSelect: (event: Event) => void;
	onClear: () => void;
	onFileInputRef?: (el: HTMLInputElement) => void;
}

export default function GameFormCover(props: GameFormCoverProps): JSX.Element {
	let fileInputEl: HTMLInputElement | undefined;

	return (
		<div class="cover-section">
			<label for="coverUrlInput" class="section-header">
				<Image size={14} />
				Cover Image *
			</label>

			<div class="cover-inputs">
				<input
					id="coverUrlInput"
					type="text"
					placeholder="Paste image URL..."
					value={props.coverUrl}
					onInput={(e) => props.onUrlChange(e.currentTarget.value)}
				/>

				<input
					ref={(el) => {
						fileInputEl = el;
						props.onFileInputRef?.(el);
					}}
					type="file"
					accept="image/*"
					class="file-input-hidden"
					onChange={(e) => props.onFileSelect(e)}
				/>
				<button type="button" class="browse-btn" onClick={() => fileInputEl?.click()}>
					Browse
				</button>
			</div>

			<Show when={props.coverError}>
				<div class="error-text">{props.coverError}</div>
			</Show>

			<Show when={props.coverPreview}>
				{(preview) => (
					<div class="cover-preview-container">
						<div class="cover-preview">
							<img src={preview()} alt="Cover preview" />
							<button type="button" class="clear-btn" onClick={() => props.onClear()} aria-label="Remove cover image">
								<X size={16} />
							</button>
						</div>
					</div>
				)}
			</Show>
		</div>
	);
}
