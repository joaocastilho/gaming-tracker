import { CloudOff, CloudUpload, WifiOff } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Match, Show, Switch } from 'solid-js';
import { offlineStore } from '#lib/stores/offline.js';
import './OfflineIndicator.css';

export default function OfflineIndicator(): JSX.Element {
	return (
		<Show when={!offlineStore.isOnline || offlineStore.hasPendingSync || offlineStore.isSyncing}>
			<div
				class={[
					'offline-indicator flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300',
					{
						'bg-orange-100': !offlineStore.isOnline && !offlineStore.hasPendingSync,
						'text-orange-700': !offlineStore.isOnline && !offlineStore.hasPendingSync,
						'bg-blue-100': offlineStore.hasPendingSync && offlineStore.isOnline && !offlineStore.isSyncing,
						'text-blue-700': offlineStore.hasPendingSync && offlineStore.isOnline && !offlineStore.isSyncing,
						'bg-green-100': offlineStore.isSyncing,
						'text-green-700': offlineStore.isSyncing,
					},
				]}
			>
				<Switch>
					<Match when={!offlineStore.isOnline}>
						<WifiOff size={14} />
						<span>Offline</span>
					</Match>
					<Match when={offlineStore.isSyncing}>
						<span class="animate-bounce">
							<CloudUpload size={14} />
						</span>
						<span>Syncing...</span>
					</Match>
					<Match when={offlineStore.hasPendingSync}>
						<CloudOff size={14} />
						<span>Pending Sync</span>
					</Match>
				</Switch>
			</div>
		</Show>
	);
}
