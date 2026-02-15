<script lang="ts">
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
		fileInputRef = $bindable()
	}: Props = $props();

	function handleUrlInput(event: Event) {
		const url = (event.target as HTMLInputElement).value;
		onUrlChange(url);
	}
</script>

<div class="cover-section">
	<label class="section-header">Cover Image</label>

	<div class="cover-inputs">
		<input
			type="text"
			placeholder="Or enter image URL..."
			value={coverUrl}
			oninput={handleUrlInput}
		/>

		<div class="file-input-wrapper">
			<input bind:this={fileInputRef} type="file" accept=".png" onchange={onFileSelect} />
		</div>
	</div>

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
	.cover-section {
		grid-column: 1 / -1;
		margin-bottom: 1rem;
	}

	.section-header {
		font-size: 0.9rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 0.5rem;
		display: block;
	}

	.cover-inputs {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.cover-inputs input[type='text'] {
		flex: 1;
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

	.file-input-wrapper {
		position: relative;
	}

	.file-input-wrapper input[type='file'] {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.file-input-wrapper::before {
		content: 'Upload PNG';
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background: rgba(99, 102, 241, 0.2);
		color: #818cf8;
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.5rem;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.file-input-wrapper:hover::before {
		background: rgba(99, 102, 241, 0.3);
	}

	.error-text {
		color: #ef4444;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.cover-preview {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.cover-preview img {
		max-width: 200px;
		max-height: 300px;
		border-radius: 0.5rem;
		object-fit: cover;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
