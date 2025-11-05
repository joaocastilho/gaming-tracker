<script lang="ts">
	import { Presentation, NotebookPen, Gamepad2 } from 'lucide-svelte';

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

	// Get the appropriate icon based on the label
	function getRatingIcon() {
		const lowerLabel = label.toLowerCase();
		if (lowerLabel.includes('presentation')) {
			return Presentation;
		} else if (lowerLabel.includes('story')) {
			return NotebookPen;
		} else if (lowerLabel.includes('gameplay')) {
			return Gamepad2;
		}
		return null; // For total score, we use the trophy emoji
	}

	// Get the appropriate color based on the label
	function getIconColor() {
		const lowerLabel = label.toLowerCase();
		if (lowerLabel.includes('presentation')) {
			return 'text-cyan-500';
		} else if (lowerLabel.includes('story')) {
			return 'text-amber-600';
		} else if (lowerLabel.includes('gameplay')) {
			return 'text-pink-500';
		}
		return 'text-gray-600'; // For total score
	}

	// Local state for slider values
	let currentMin = $state(minValue);
	let currentMax = $state(maxValue);

	// DOM references
	let sliderContainer: HTMLDivElement;
	let isDragging = $state(false);
	let dragType: 'min' | 'max' | null = $state(null);

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

	// Handle drag start for the visible drag handles
	function handleDragStart(event: MouseEvent, type: 'min' | 'max') {
		if (disabled) return;

		dragType = type;
		isDragging = true;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		event.preventDefault();
	}

	// Handle mouse events for dragging the filled bar
	function handleMouseDown(event: MouseEvent) {
		if (disabled || !sliderContainer) return;

		const rect = sliderContainer.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const containerWidth = rect.width;
		const clickPercentage = clickX / containerWidth;

		const minPercent = getMinPercentage() / 100;
		const maxPercent = getMaxPercentage() / 100;
		const filledStart = minPercent;
		const filledEnd = maxPercent;

		// Check if clicking on the filled portion
		if (clickPercentage >= filledStart && clickPercentage <= filledEnd) {
			// Determine which edge is closer
			const distanceToMin = Math.abs(clickPercentage - minPercent);
			const distanceToMax = Math.abs(clickPercentage - maxPercent);

			dragType = distanceToMin <= distanceToMax ? 'min' : 'max';
			isDragging = true;
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			event.preventDefault();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || !sliderContainer || disabled) return;

		const rect = sliderContainer.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const containerWidth = rect.width;
		const mousePercentage = Math.max(0, Math.min(1, mouseX / containerWidth));

		const newValue = Math.round((mousePercentage * (maxLimit - minLimit) + minLimit) / step) * step;
		const clampedValue = clamp(newValue, minLimit, maxLimit);

		if (dragType === 'min') {
			updateRange(clampedValue, currentMax, true);
		} else if (dragType === 'max') {
			updateRange(currentMin, clampedValue, false);
		}
	}

	function handleMouseUp() {
		isDragging = false;
		dragType = null;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
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

	// Get consistent color for all bars (neutral)
	function getRatingColor(value: number): string {
		return '#6b7280'; // Consistent gray color for all bars
	}
</script>

<div class="rating-slider" style="--min-color: {getRatingColor(currentMin)}; --max-color: {getRatingColor(currentMax)}">
	<div class="slider-header">
		<span class="slider-label">
			{#if getRatingIcon()}
				<svelte:component
					this={getRatingIcon()}
					class="filter-icon {getIconColor()}"
					aria-label="{label} filter"
					size={20}
				/>
			{:else}
				<span class="filter-icon" aria-label="Rating filter">🏆</span>
			{/if}
			{label} {currentMin} - {currentMax}
		</span>
		{#if !isDefaultRange()}
			<button
				type="button"
				class="reset-button"
				onclick={(event) => { event.stopPropagation(); resetRange(); }}
				{disabled}
				title="Reset to default range"
			>
				Reset
			</button>
		{/if}
	</div>

	<div class="slider-container" bind:this={sliderContainer}>
		<!-- Dual-range slider -->
		<div class="dual-slider-row">

			<!-- Track background with drag handles -->
			<div class="slider-track" onmousedown={handleMouseDown}>
				<div
					class="slider-fill"
					style="left: {getMinPercentage()}%; width: {getMaxPercentage() - getMinPercentage()}%"
				>
					<!-- Left drag handle -->
					<div
						class="drag-handle drag-handle-left"
						onmousedown={(e) => handleDragStart(e, 'min')}
						style="background-color: {getRatingColor(currentMin)}"
					></div>

					<!-- Right drag handle -->
					<div
						class="drag-handle drag-handle-right"
						onmousedown={(e) => handleDragStart(e, 'max')}
						style="background-color: {getRatingColor(currentMax)}"
					></div>
				</div>

				<!-- Hidden input sliders for accessibility and fallback -->
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

		</div>
	</div>


</div>

<style>
	.rating-slider {
		display: flex;
		flex-direction: column;
		min-width: 200px;
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slider-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.filter-icon {
		width: 20px;
		height: 20px;
		color: var(--color-text-secondary);
		flex-shrink: 0;
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
	}

	.dual-slider-row {
		position: relative;
		height: 60px;
		display: flex;
	}

	.slider-track {
		position: relative;
		width: 275px;
		height: 20px;
		background-color: #e5e7eb;
		border-radius: 10px;
		border: 1px solid var(--color-border);
		margin: 0 auto;
	}

	.slider-fill {
		position: absolute;
		top: 0;
		height: 60px;
		background-color: rgba(59, 130, 246, 0.6);
		border-radius: 10px;
		transition: left 0.1s ease, width 0.1s ease;
		pointer-events: none;
	}

	.slider-thumb {
		position: absolute;
		width: 100%;
		height: 60px;
		opacity: 1;
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
		height: 10px;
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
		font-weight: 500;
		color: var(--color-text-primary);
		min-width: 24px;
		text-align: center;
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

	/* Drag handles for the filled bar */
	.drag-handle {
		position: absolute;
		top: 50%;
		width: 16px;
		height: 16px;
		border-radius: 2px;
		border: 2px solid var(--background);
		cursor: pointer;
		transform: translateY(-50%);
		z-index: 5;
		transition: all 0.2s ease;
		box-shadow: 0 0 0 0 currentColor;
	}

	.drag-handle:hover {
		box-shadow: 0 0 0 4px currentColor;
		transform: translateY(-50%) scale(1.1);
	}

	.drag-handle:active {
		box-shadow: 0 0 0 6px currentColor;
		transform: translateY(-50%) scale(1.2);
	}

	.drag-handle-left {
		left: -8px;
	}

	.drag-handle-right {
		right: -8px;
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

		.drag-handle {
			transition: none;
		}
	}
</style>
