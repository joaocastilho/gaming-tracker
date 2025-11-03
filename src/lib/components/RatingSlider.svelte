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
</script>

<div class="rating-slider">
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

	<div
		class="slider-container"
		style="--min-percent: {getMinPercentage()}%; --max-percent: {getMaxPercentage()}%"
	>
		<!-- Track background with fill -->
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
			style="left: {getMinPercentage()}%"
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
			style="left: {getMaxPercentage()}%"
		/>
	</div>

	<div class="slider-values">
		<span class="value-display min-value">{getDisplayValues().min}</span>
		<span class="range-indicator">–</span>
		<span class="value-display max-value">{getDisplayValues().max}</span>
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
		position: relative;
		height: 32px;
		display: flex;
		align-items: center;
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
		top: 0;
		height: 100%;
		background-color: #3b82f6;
		border-radius: 2px;
		transition:
			left 0.1s ease,
			width 0.1s ease;
	}

	.slider-thumb {
		position: absolute;
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		transition:
			box-shadow 0.2s ease,
			background-color 0.2s ease;
		z-index: 10;
	}

	.slider-thumb:hover:not(:disabled) {
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
	}

	.slider-thumb:active:not(:disabled) {
		box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
	}

	.slider-thumb:disabled {
		background-color: #6b7280;
		cursor: not-allowed;
		box-shadow: none;
	}

	.slider-thumb:focus {
		outline: none;
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
	}

	/* Position thumbs using inline styles */

	/* Hide default range slider appearance */
	.slider-thumb::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
	}

	.slider-thumb::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background-color: #3b82f6;
		border: 2px solid var(--background);
		border-radius: 50%;
		cursor: pointer;
		border: none;
	}

	.slider-thumb::-webkit-slider-track {
		background: transparent;
	}

	.slider-thumb::-moz-range-track {
		background: transparent;
		border: none;
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
