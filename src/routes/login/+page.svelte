<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { editorStore } from '$lib/stores/editor';

	let loginModalRef: InstanceType<typeof LoginModal> | null = null;
	let editorMode = false;

	// Subscribe to editor store to check login status
	const unsubscribe = editorStore.subscribe(($s) => {
		editorMode = $s.editorMode;
	});

	onMount(() => {
		// If already logged in, redirect to home
		if (editorMode) {
			goto('/');
			return;
		}

		// Open the login modal automatically
		if (loginModalRef && typeof loginModalRef.openModal === 'function') {
			loginModalRef.openModal();
		}

		return () => {
			unsubscribe();
		};
	});

	// Watch for successful login and redirect
	$: if (editorMode) {
		goto('/');
	}
</script>

<LoginModal bind:this={loginModalRef} />

<div class="login-page">
	<div class="login-container">
		<h1>Owner Access</h1>
		<p>Please sign in to access editor mode.</p>
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
</style>
