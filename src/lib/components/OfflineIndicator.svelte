<script lang="ts">
	import { offlineStore } from '$lib/stores/offline.svelte';
	import { CloudOff, WifiOff, CloudUpload } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let isOnline = $derived(offlineStore.isOnline);
	let hasPendingSync = $derived(offlineStore.hasPendingSync);
	let isSyncing = $derived(offlineStore.isSyncing);
</script>

{#if !isOnline || hasPendingSync || isSyncing}
	<div
		class="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300"
		class:bg-orange-100={!isOnline && !hasPendingSync}
		class:text-orange-700={!isOnline && !hasPendingSync}
		class:bg-blue-100={hasPendingSync && isOnline && !isSyncing}
		class:text-blue-700={hasPendingSync && isOnline && !isSyncing}
		class:bg-green-100={isSyncing}
		class:text-green-700={isSyncing}
		transition:fade
	>
		{#if !isOnline}
			<WifiOff size={14} />
			<span>Offline</span>
		{:else if isSyncing}
			<span class="animate-bounce">
				<CloudUpload size={14} />
			</span>
			<span>Syncing...</span>
		{:else if hasPendingSync}
			<CloudOff size={14} />
			<span>Pending Sync</span>
		{/if}
	</div>
{/if}

<style>
	.animate-bounce {
		animation: bounce 1s infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(-10%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}
</style>
