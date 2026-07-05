<script lang="ts">
import { Image, X } from '@lucide/svelte';

interface Props {
	coverUrl: string;
	coverPreview: string | null;
	coverError: string | null;
	onUrlChange: (url: string) => void;
	onFileSelect: (event: Event) => void;
	onClear: () => void;
	fileInputRef?: HTMLInputElement;
}

let {
	coverUrl,
	coverPreview,
	coverError,
	onUrlChange,
	onFileSelect,
	onClear,
	fileInputRef = $bindable(),
}: Props = $props();

function handleUrlInput(event: Event) {
	const url = (event.target as HTMLInputElement).value;
	onUrlChange(url);
}

function triggerFileInput() {
	fileInputRef?.click();
}
</script>

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
			value={coverUrl}
			oninput={handleUrlInput}
		/>

		<input bind:this={fileInputRef} type="file" accept="image/*" class="file-input-hidden" onchange={onFileSelect} />
		<button type="button" class="browse-btn" onclick={triggerFileInput}>Browse</button>
	</div>

	{#if coverError}
		<div class="error-text">{coverError}</div>
	{/if}

	{#if coverPreview}
		<div class="cover-preview-container">
			<div class="cover-preview">
				<img src={coverPreview} alt="Cover preview" />
				<button type="button" class="clear-btn" onclick={onClear} aria-label="Remove cover image">
					<X size={16} />
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.section-header {
		font-size: 0.9rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.cover-inputs {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.cover-inputs input[type='text'] {
		flex: 1;
		min-width: 0;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
	}

	.cover-inputs input[type='text']:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	.file-input-hidden {
		display: none;
	}

	.browse-btn {
		padding: 0.5rem 0.85rem;
		background: rgba(99, 102, 241, 0.2);
		color: #818cf8;
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.5rem;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.browse-btn:hover {
		background: rgba(99, 102, 241, 0.3);
	}

	.error-text {
		color: #ef4444;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.cover-preview-container {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.cover-preview {
		position: relative;
		display: inline-block;
	}

	.cover-preview img {
		width: 140px;
		height: 210px;
		border-radius: 0.5rem;
		object-fit: cover;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		display: block;
	}

	.clear-btn {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ef4444;
		color: white;
		border: 2px solid #020817;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.clear-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
	}
</style>
