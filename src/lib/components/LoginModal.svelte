<script lang="ts">
	import { editorStore } from '$lib/stores/editor.svelte';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
	let username = $state('');
	let password = $state('');

	// Derive login state from editor store
	let loginPending = $derived(editorStore.loginPending);
	let loginError = $derived(editorStore.loginError);

	// Reset form when modal opens
	$effect(() => {
		if (open) {
			username = '';
			password = '';
		}
	});

	function closeModal() {
		if (loginPending) return;
		open = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!username || !password || loginPending) return;

		const ok = await editorStore.login(username, password);
		if (ok) {
			open = false;
		}
	}
</script>

{#if open}
	<div
		class="login-backdrop"
		role="presentation"
		onclick={closeModal}
		onkeydown={(event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closeModal();
			}
		}}
		tabindex="-1"
	>
		<div
			class="login-modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(event) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					closeModal();
				}
			}}
		>
			<h2>Owner Login</h2>
			<p class="hint">Sign in to enable editor mode.</p>
			<form onsubmit={handleSubmit}>
				<label>
					<span>Username</span>
					<input
						type="text"
						bind:value={username}
						autocomplete="username"
						required
						placeholder="Username"
					/>
				</label>
				<label>
					<span>Password</span>
					<input
						type="password"
						bind:value={password}
						autocomplete="current-password"
						required
						placeholder="Password"
					/>
				</label>

				{#if loginError}
					<div class="error">{loginError}</div>
				{/if}

				<div class="actions">
					<button type="button" class="secondary" onclick={closeModal} disabled={loginPending}>
						Cancel
					</button>
					<button type="submit" class="primary" disabled={loginPending}>
						{#if loginPending}
							Signing in...
						{:else}
							Sign in
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.login-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.login-modal {
		background: #020817;
		border-radius: 16px;
		padding: 1.75rem 1.75rem 1.5rem;
		min-width: 260px;
		max-width: 360px;
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.7);
		border: 1px solid rgba(148, 163, 253, 0.2);
		color: #e5e7eb;
	}

	h2 {
		margin: 0 0 0.35rem;
		font-size: 1.2rem;
		font-weight: 600;
	}

	.hint {
		margin: 0 0 1rem;
		font-size: 0.8rem;
		color: #9ca3af;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: #9ca3af;
	}

	input {
		padding: 0.4rem 0.6rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.9);
		background: #020817;
		color: #e5e7eb;
		font-size: 0.85rem;
	}

	input:focus-visible {
		outline: 2px solid rgba(129, 140, 248, 0.8);
		outline-offset: 1px;
		border-color: transparent;
	}

	.error {
		margin-top: 0.2rem;
		font-size: 0.75rem;
		color: #fca5a5;
	}

	.actions {
		margin-top: 0.8rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	button {
		border-radius: 999px;
		padding: 0.35rem 0.9rem;
		border: none;
		font-size: 0.8rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}

	button.primary {
		background: #4f46e5;
		color: #e5e7eb;
	}

	button.primary:hover {
		background: #4338ca;
	}

	button.secondary {
		background: transparent;
		color: #9ca3af;
	}

	button.secondary:hover {
		color: #e5e7eb;
		background: rgba(148, 163, 253, 0.06);
	}

	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
