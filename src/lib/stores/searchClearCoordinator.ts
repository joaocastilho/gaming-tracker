/**
 * Shared search clear coordination
 * Used to prevent race conditions between SearchBar clear and URL sync effect
 */

export let lastManualClearTime = 0;

export function markSearchCleared() {
	lastManualClearTime = Date.now();
}
