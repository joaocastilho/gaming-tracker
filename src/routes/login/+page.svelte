<script lang="ts">
	import { goto } from '$app/navigation';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';

	let isModalOpen = $state(true);
	let editorMode = $derived(editorStore.editorMode);

	// Get version from Vite define (set at build time)
	const appVersion = __APP_VERSION__;

	$effect(() => {
		if (editorMode) {
			goto('/');
		}
	});
</script>

<LoginModal bind:open={isModalOpen} />

<div class="login-page">
	<div class="login-container">
		<h1>Owner Access</h1>
		<p>Please sign in to access editor mode.</p>
		<span class="version">v{appVersion}</span>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.login-container {
		text-align: center;
		max-width: 400px;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}

	p {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.version {
		display: block;
		margin-top: 1.5rem;
		font-size: 0.75rem;
		color: var(--color-text-tertiary, #6b7280);
		font-family: monospace;
		opacity: 0.7;
	}
</style>
