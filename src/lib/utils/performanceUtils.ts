/**
 * Performance monitoring utilities for identifying bottlenecks
 */

export class PerformanceTimer {
	private startTime: number;
	private label: string;

	constructor(label: string) {
		this.label = label;
		this.startTime = performance.now();
	}

	end(): number {
		const duration = performance.now() - this.startTime;
		return duration;
	}
}

/**
 * Measure navigation performance
 */
export function measureNavigation(target: string): PerformanceTimer {
	return new PerformanceTimer(`Navigation to ${target}`);
}

/**
 * Measure filter processing performance
 */
export function measureFilterProcessing(): PerformanceTimer {
	return new PerformanceTimer('Filter processing');
}

/**
 * Measure store updates performance
 */
export function measureStoreUpdates(): PerformanceTimer {
	return new PerformanceTimer('Store updates');
}

/**
 * Measure component rendering performance
 */
export function measureComponentRender(component: string): PerformanceTimer {
	return new PerformanceTimer(`${component} render`);
}

/**
 * Debounced performance measurement to avoid spam
 */
const performanceLogs = new Map<string, number>();

export function debouncedPerfLog(label: string, duration: number, cooldown = 1000) {
	const now = Date.now();
	const lastLog = performanceLogs.get(label) || 0;

	if (now - lastLog > cooldown) {
		performanceLogs.set(label, now);
	}
}

/**
 * Performance monitoring wrapper for async operations
 */
export async function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
	const timer = new PerformanceTimer(label);
	try {
		const result = await fn();
		timer.end();
		return result;
	} catch (error) {
		timer.end();
		throw error;
	}
}
