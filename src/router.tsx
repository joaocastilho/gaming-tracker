import { Gamepad2 } from '@lucide/solid';
import { Title } from '@solidjs/meta';
import { createRouter, defineRoutes } from '@solidjs/router';
import type { JSX } from '@solidjs/web';
import { createMemo, createSignal } from 'solid-js';

function ToolchainSmokePage(): JSX.Element {
	const [count, setCount] = createSignal(0);
	const doubled = createMemo(() => count() * 2);

	return (
		<main class="p-6">
			<Title>Gaming Tracker — Solid 2.0</Title>
			<h1 class="flex items-center gap-2 text-xl font-bold">
				<Gamepad2 size={20} />
				<span>Gaming Tracker</span>
			</h1>
			<button type="button" onClick={() => setCount((c) => c + 1)}>
				Count: {count()} (x2: {doubled()})
			</button>
		</main>
	);
}

const routes = defineRoutes([
	{ path: '/', component: ToolchainSmokePage },
	{ path: '*404', component: ToolchainSmokePage },
]);

export const Router = createRouter({ routes });
