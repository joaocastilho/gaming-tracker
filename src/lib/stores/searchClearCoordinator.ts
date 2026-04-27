export let lastManualClearTime = 0;

export function markSearchCleared() {
	lastManualClearTime = Date.now();
}
