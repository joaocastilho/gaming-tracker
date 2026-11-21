import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, Show } from 'solid-js';
import { editorStore } from '#lib/stores/editor.js';
import { dev } from '#lib/utils/env.js';
import './LoginModal.css';

export interface LoginModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function LoginModal(props: LoginModalProps): JSX.Element {
	const [username, setUsername] = createSignal('');
	const [password, setPassword] = createSignal('');

	createEffect(
		() => props.open,
		(open) => {
			if (open) {
				setUsername('');
				setPassword('');
			}
		}
	);

	function closeModal(): void {
		if (editorStore.loginPending) return;
		props.onOpenChange?.(false);
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!username() || !password() || editorStore.loginPending) return;

		const ok = await editorStore.login(username(), password());
		if (ok) {
			props.onOpenChange?.(false);
		}
	}

	function enableDevMode(): void {
		editorStore.setEditorModeFromSessionCheck(true);
		props.onOpenChange?.(false);
	}

	return (
		<Show when={props.open}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop dismisses on outside click */}
			<div
				class="login-backdrop"
				role="presentation"
				onClick={closeModal}
				onKeyDown={(event) => {
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
					aria-labelledby="login-title"
					aria-describedby="login-description"
					tabindex="-1"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(event) => {
						if (event.key === 'Escape') {
							event.preventDefault();
							closeModal();
						}
					}}
				>
					<h2 id="login-title">Owner Login</h2>
					<p id="login-description" class="hint">
						Sign in to enable editor mode.
					</p>
					<form onSubmit={(e) => void handleSubmit(e)}>
						<label>
							<span>Username</span>
							<input
								type="text"
								value={username()}
								onInput={(e) => setUsername(e.currentTarget.value)}
								autocomplete="username"
								required
								placeholder="Username"
							/>
						</label>
						<label>
							<span>Password</span>
							<input
								type="password"
								value={password()}
								onInput={(e) => setPassword(e.currentTarget.value)}
								autocomplete="current-password"
								required
								placeholder="Password"
							/>
						</label>

						<Show when={editorStore.loginError}>
							<div class="error">{editorStore.loginError}</div>
						</Show>

						<div class="actions">
							<button type="button" class="secondary" onClick={closeModal} disabled={editorStore.loginPending}>
								Cancel
							</button>
							<button type="submit" class="primary" disabled={editorStore.loginPending}>
								{editorStore.loginPending ? 'Signing in...' : 'Sign in'}
							</button>
						</div>

						<Show when={dev}>
							<button type="button" class="dev-mode-btn" onClick={enableDevMode}>
								🛠️ Enable Dev Mode (skip login)
							</button>
						</Show>
					</form>
				</div>
			</div>
		</Show>
	);
}
