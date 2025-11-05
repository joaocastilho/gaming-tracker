<script lang="ts">
	interface Props {
		label: string;
		minValue: number;
		maxValue: number;
		step?: number;
		minLimit: number;
		maxLimit: number;
		disabled?: boolean;
		onRangeChange?: (min: number, max: number) => void;
	}

	let {
		label,
		minValue,
		maxValue,
		step = 1,
		minLimit,
		maxLimit,
		disabled = false,
		onRangeChange = () => {}
	}: Props = $props();

	// Local state for slider values
	let currentMin = $state(minValue);
	let currentMax = $state(maxValue);

	// Update local state when props change
	$effect(() => {
		currentMin = minValue;
		currentMax = maxValue;
	});

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function updateRange(newMin: number, newMax: number, isMinSlider = false) {
		if (disabled) return;

		let clampedMin = clamp(newMin, minLimit, maxLimit);
		let clampedMax = clamp(newMax, minLimit, maxLimit);

		// Ensure min doesn't exceed max
		if (isMinSlider) {
			clampedMin = Math.min(clampedMin, clampedMax);
		} else {
			clampedMax = Math.max(clampedMax, clampedMin);
		}

		// Round to step
		clampedMin = Math.round(clampedMin / step) * step;
		clampedMax = Math.round(clampedMax / step) * step;

		currentMin = clampedMin;
		currentMax = clampedMax;

		onRangeChange(clampedMin, clampedMax);
	}

	function handleMinInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		updateRange(value, currentMax, true);
	}

	function handleMaxInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		updateRange(currentMin, value, false);
	}

	function resetRange() {
		updateRange(minLimit, maxLimit);
	}

	// Calculate percentage for track fill
	function getMinPercentage(): number {
		return ((currentMin - minLimit) / (maxLimit - minLimit)) * 100;
	}

	function getMaxPercentage(): number {
		return ((currentMax - minLimit) / (maxLimit - minLimit)) * 100;
	}

	// Check if range is at default values
	function isDefaultRange(): boolean {
		return currentMin === minLimit && currentMax === maxLimit;
	}

	function getDisplayValues(): { min: number; max: number } {
		return {
			min: currentMin,
			max: currentMax
		};
	}

	// Get color based on rating value (using tier color scheme)
	function getRatingColor(value: number): string {
		if (maxLimit === 20) {
			// For total score (0-20), map to tier colors
			if (value >= 18) return '#dc2626'; // S - Red
			if (value >= 16) return '#f97316'; // A - Orange
			if (value >= 14) return '#eab308'; // B - Yellow
			if (value >= 12) return '#22c55e'; // C - Green
			if (value >= 10) return '#06b6d4'; // D - Cyan
			return '#6b7280'; // E - Gray
		} else {
			// For individual ratings (0-10), map to tier colors
			if (value >= 9) return '#dc2626'; // S - Red
			if (value >= 8) return '#f97316'; // A - Orange
			if (value >= 7) return '#eab308'; // B - Yellow
			if (value >= 6) return '#22c55e'; // C - Green
			if (value >= 5) return '#06b6d4'; // D - Cyan
			return '#6b7280'; // E - Gray
		}
	}
</script>

<div class="rating-slider" style="--min-color: {getRatingColor(currentMin)}; --max-color: {getRatingColor(currentMax)}">
	<div class="slider-header">
		<span class="slider-label">{label}</span>
		{#if !isDefaultRange()}
			<button
				type="button"
				class="reset-button"
				onclick={resetRange}
				{disabled}
				title="Reset to default range"
			>
				Reset
			</button>
		{/if}
	</div>

	<div class="slider-container">
		<!-- Dual-range slider -->
		<div class="dual-slider-row">
			<!-- Track background -->
			<div class="slider-track">
				<div
					class="slider-fill"
					style="left: {getMinPercentage()}%; width: {getMaxPercentage() - getMinPercentage()}%"
				></div>
			</div>

			<!-- Min slider -->
			<input
				type="range"
				class="slider-thumb slider-thumb-min"
				min={minLimit}
				max={maxLimit}
				{step}
				value={currentMin}
				oninput={handleMinInput}
				{disabled}
				aria-label="Minimum {label.toLowerCase()} rating"
			/>

			<!-- Max slider -->
			<input
				type="range"
				class="slider-thumb slider-thumb-max"
				min={minLimit}
				max={maxLimit}
				{step}
				value={currentMax}
				oninput={handleMaxInput}
				{disabled}
				aria-label="Maximum {label.toLowerCase()} rating"
			/>
		</div>

		<!-- Value display -->
		<div class="slider-values">
			<span class="value-display min-value" style="color: {getRatingColor(currentMin)}">{currentMin}</span>
			<span class="range-indicator">–</span>
			<span class="value-display max-value" style="color: {getRatingColor(currentMax)}">{currentMax}</span>
		</div>
	</div>


</div>

<style>
	.rating-slider {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 200px;
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slider-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.reset-button {
		font-size: 0.75rem;
		color: #3b82f6;
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.reset-button:hover:not(:disabled) {
		background-color: rgba(59, 130, 246, 0.1);
	}

	.reset-button:disabled {
		color: #6b7280;
		cursor: not-allowed;
	}

	.slider-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.dual-slider-row {
		position: relative;
		height: 40px;
		display: flex;
		align-items: center;
	}

	.slider-track {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 8px;
		background: linear-gradient(to right,
			#6b7280 0%,   /* E - Gray */
			#06b6d4 20%,  /* D - Cyan */
			#22c55e 40%,  /* C - Green */
			#eab308 60%,  /* B - Yellow */
			#f97316 80%,  /* A - Orange */
			#dc2626 100%  /* S - Red */
		);
		border-radius: 4px;
		border: 1px solid var(--color-border);
		transform: translateY(-50%);
	}

	.slider-fill {
		position: absolute;
		top: 50%;
		height: 8px;
		background-color: rgba(59, 130, 246, 0.3);
		border-radius: 4px;
		transform: translateY(-50%);
		transition: left 0.1s ease, width 0.1s ease;
		pointer-events: none;
	}

	.slider-thumb {
		position: absolute;
		width: 100%;
		height: 40px;
		opacity: 0;
		cursor: pointer;
		margin: 0;
		padding: 0;
	}

	.slider-thumb-min::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background-color: var(--min-color);
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 0 0 var(--min-color);
		transition: all 0.2s ease;
		opacity: 0.9;
		z-index: 3;
	}

	.slider-thumb-min::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 6px var(--min-color);
		transform: scale(1.1);
		opacity: 1;
	}

	.slider-thumb-min::-webkit-slider-thumb:active {
		box-shadow: 0 0 0 8px var(--min-color);
		transform: scale(1.2);
		opacity: 1;
	}

	.slider-thumb-max::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background-color: var(--max-color);
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 0 0 var(--max-color);
		transition: all 0.2s ease;
		opacity: 0.9;
		z-index: 4;
	}

	.slider-thumb-max::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 6px var(--max-color);
		transform: scale(1.1);
		opacity: 1;
	}

	.slider-thumb-max::-webkit-slider-thumb:active {
		box-shadow: 0 0 0 8px var(--max-color);
		transform: scale(1.2);
		opacity: 1;
	}

	/* Hide the default track for both sliders */
	.slider-thumb-min::-webkit-slider-track,
	.slider-thumb-max::-webkit-slider-track {
		background: transparent;
		height: 8px;
		border: none;
	}

	.slider-input::-moz-range-track {
		width: 100%;
		height: 4px;
		background-color: #374151;
		border-radius: 2px;
		border: none;
	}

	:global(.light) .slider-input::-moz-range-track {
		background-color: #d1d5db;
	}

	.slider-input::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.2);
		transition: box-shadow 0.2s ease;
	}

	.slider-input::-moz-range-thumb:hover {
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
	}

	.slider-input::-moz-range-thumb:active {
		box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
	}

	.slider-input:disabled {
		cursor: not-allowed;
	}

	.slider-input:disabled::-webkit-slider-thumb {
		background-color: #6b7280;
		cursor: not-allowed;
		box-shadow: none;
	}

	.slider-input:disabled::-moz-range-thumb {
		background-color: #6b7280;
		cursor: not-allowed;
		box-shadow: none;
	}

	.slider-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		min-width: 20px;
		text-align: center;
		background-color: var(--color-surface);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid var(--color-border);
	}

	.slider-track {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 4px;
		background-color: #374151;
		border-radius: 2px;
		transform: translateY(-50%);
	}

	:global(.light) .slider-track {
		background-color: #d1d5db;
	}

	.slider-fill {
		position: absolute;
		top: 50%;
		height: 4px;
		background-color: #3b82f6;
		border-radius: 2px;
		transform: translateY(-50%);
		transition:
			left 0.1s ease,
			width 0.1s ease;
	}

	.slider-thumb {
		position: absolute;
		width: 100%;
		height: 20px;
		opacity: 0;
		cursor: pointer;
		margin: 0;
		padding: 0;
	}

	/* Custom thumb styling */
	.slider-thumb::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.2);
		transition: box-shadow 0.2s ease;
	}

	.slider-thumb::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
	}

	.slider-thumb::-webkit-slider-thumb:active {
		box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
	}

	.slider-thumb::-webkit-slider-track {
		background: transparent;
		height: 4px;
	}

	.slider-thumb::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.2);
		transition: box-shadow 0.2s ease;
	}

	.slider-thumb::-moz-range-thumb:hover {
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
	}

	.slider-thumb::-moz-range-thumb:active {
		box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
	}

	.slider-thumb::-moz-range-track {
		background: transparent;
		height: 4px;
		border: none;
	}

	.slider-thumb:disabled {
		cursor: not-allowed;
	}

	.slider-thumb:disabled::-webkit-slider-thumb {
		background-color: #6b7280;
		cursor: not-allowed;
		box-shadow: none;
	}

	.slider-thumb:disabled::-moz-range-thumb {
		background-color: #6b7280;
		cursor: not-allowed;
		box-shadow: none;
	}

	.slider-values {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.value-display {
		background-color: var(--color-surface);
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 500;
		color: var(--color-text-primary);
		min-width: 24px;
		text-align: center;
		border: 1px solid var(--color-border);
	}

	.range-indicator {
		font-weight: 500;
		margin: 0 8px;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.rating-slider {
			min-width: unset;
			width: 100%;
		}

		.slider-thumb {
			width: 18px;
			height: 18px;
		}

		.slider-thumb::-webkit-slider-thumb {
			width: 18px;
			height: 18px;
		}

		.slider-thumb::-moz-range-thumb {
			width: 18px;
			height: 18px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.slider-fill {
			transition: none;
		}

		.slider-thumb {
			transition: none;
		}

		.reset-button {
			transition: none;
		}
	}
</style>
