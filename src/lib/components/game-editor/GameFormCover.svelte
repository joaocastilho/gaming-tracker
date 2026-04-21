<script lang="ts">
import { Image } from 'lucide-svelte';

interface Props {
	coverUrl: string;
	coverPreview: string | null;
	coverError: string | null;
	onUrlChange: (url: string) => void;
	onClear: () => void;
}

let { coverUrl, coverPreview, coverError, onUrlChange, onClear }: Props = $props();

function handleUrlInput(event: Event) {
	const url = (event.target as HTMLInputElement).value;
	onUrlChange(url);
}
</script>

<div class="cover-section">
	<label for="coverUrlInput" class="section-header">
		<Image size={14} />
		Cover Image
	</label>

	<input
		id="coverUrlInput"
		type="text"
		placeholder="Paste image URL..."
		value={coverUrl}
		oninput={handleUrlInput}
	/>

	{#if coverError}
		<div class="error-text">{coverError}</div>
	{/if}

	{#if coverPreview}
		<div class="cover-preview">
			<img src={coverPreview} alt="Cover preview" />
			<button type="button" class="clear-btn" onclick={onClear}> Remove </button>
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

	#coverUrlInput {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
		box-sizing: border-box;
	}

	#coverUrlInput:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	.error-text {
		color: #ef4444;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.cover-preview {
		margin-top: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.cover-preview img {
		width: 60px;
		height: 90px;
		border-radius: 0.375rem;
		object-fit: cover;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		flex-shrink: 0;
	}

	.clear-btn {
		padding: 0.375rem 0.75rem;
		background: rgba(239, 68, 68, 0.2);
		color: #fca5a5;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.375rem;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background: rgba(239, 68, 68, 0.3);
	}
</style>
