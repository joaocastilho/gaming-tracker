import type { JSX } from '@solidjs/web';
import { createEffect, createSignal } from 'solid-js';
import LoginModal from '#lib/components/LoginModal.js';
import { editorStore } from '#lib/stores/editor.js';
import { goto } from '#lib/utils/routerBridge.js';
import './LoginPage.css';

const buildDate = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
}).format(new Date(__BUILD_DATE__));

export default function LoginPage(): JSX.Element {
	const [isModalOpen, setIsModalOpen] = createSignal(true);

	createEffect(
		() => editorStore.editorMode,
		(editorMode) => {
			if (editorMode) {
				void goto('/');
			}
		}
	);

	return (
		<>
			<LoginModal open={isModalOpen()} onOpenChange={setIsModalOpen} />
			<div class="login-page">
				<div class="login-container">
					<h1>Owner Access</h1>
					<p>Please sign in to access editor mode.</p>
					<span class="version">Last updated {buildDate}</span>
				</div>
			</div>
		</>
	);
}
