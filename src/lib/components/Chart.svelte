<script lang="ts">
import { Chart, type ChartType, type ChartData, type ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { appStore } from '$lib/stores/app.svelte';

Chart.register(...registerables, ChartDataLabels);

interface Props {
	type: ChartType;
	data: ChartData;
	options?: Record<string, unknown>;
	height?: number;
}

let { type, data, options = {}, height = 280 }: Props = $props();

let canvasElement: HTMLCanvasElement;
let chartInstance: Chart | null = null;

let textColor = $derived(appStore.theme === 'dark' ? '#a0a0a0' : '#666666');

function buildOptions(): ChartOptions {
	return {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 800, easing: 'easeOutQuart' },
		font: { family: 'Inter, system-ui, sans-serif' },
		plugins: {
			legend: {
				labels: {
					color: textColor,
					font: { size: 12 },
					padding: 12,
				},
			},
			tooltip: {
				backgroundColor: appStore.theme === 'dark' ? '#1a1c23' : '#ffffff',
				titleColor: appStore.theme === 'dark' ? '#e0e0e0' : '#333333',
				bodyColor: appStore.theme === 'dark' ? '#a0a0a0' : '#666666',
				borderColor: appStore.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
				borderWidth: 1,
				padding: 12,
				cornerRadius: 8,
				boxPadding: 6,
			},
		},
		scales: options?.scales || {
			x: {
				grid: { display: false },
				ticks: { color: textColor, font: { size: 11 } },
			},
			y: {
				grid: { display: false },
				ticks: { color: textColor, font: { size: 11 } },
				beginAtZero: true,
			},
		},
		...options,
	} as ChartOptions;
}

$effect(() => {
	if (!canvasElement) return;

	if (chartInstance) {
		chartInstance.destroy();
	}

	chartInstance = new Chart(canvasElement, {
		type,
		data,
		options: buildOptions(),
	});

	return () => {
		chartInstance?.destroy();
		chartInstance = null;
	};
});

$effect(() => {
	void textColor;
	if (chartInstance) {
		chartInstance.destroy();
		chartInstance = new Chart(canvasElement, {
			type,
			data,
			options: buildOptions(),
		});
	}
});
</script>

<div class="chart-wrapper" style="height: {height}px;">
	<canvas bind:this={canvasElement}></canvas>
</div>

<style>
	.chart-wrapper {
		width: 100%;
		position: relative;
	}
</style>
