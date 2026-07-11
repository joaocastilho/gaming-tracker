let lastManualClearTime = 0;

export function markSearchCleared() {
	lastManualClearTime = Date.now();
}

export function getLastManualClearTime(): number {
	return lastManualClearTime;
}
