<script lang="ts">
	import { appStore } from '$lib/stores/app';

	$effect(() => {
		appStore.setActiveTab('tierlist', true);
	});
</script>
