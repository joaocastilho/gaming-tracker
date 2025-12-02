<script lang="ts">
	import { appStore } from '$lib/stores/app';

	// Force active tab to tierlist
	$effect(() => {
		appStore.setActiveTab('tierlist', true);
	});
</script>
