<script lang="ts">
import type { Chart, ChartData, ChartOptions, ChartType } from 'chart.js';
import { untrack } from 'svelte';
import { appStore } from '#lib/stores/app.svelte.js';

// Chart.js and its datalabels plugin are a ~207 KB chunk that only this
// component needs. Importing them dynamically keeps them out of the layout's
// modulepreload graph, so every other route skips the download.
let chartLoader: Promise<typeof import('chart.js')> | null = null;

function loadChart(): Promise<typeof import('chart.js')> {
	chartLoader ??= Promise.all([import('chart.js'), import('chartjs-plugin-datalabels')]).then(
		([chartJs, dataLabels]) => {
			chartJs.Chart.register(
				chartJs.BarController,
				chartJs.BarElement,
				chartJs.CategoryScale,
				chartJs.LinearScale,
				chartJs.Tooltip,
				chartJs.Legend,
				chartJs.LineController,
				chartJs.LineElement,
				chartJs.PointElement,
				chartJs.Filler,
				dataLabels.default
			);
			return chartJs;
		}
	);
	return chartLoader;
}

interface Props {
	type: ChartType;
	data: ChartData;
	options?: Record<string, unknown>;
	height?: number;
}

let { type, data, options = {}, height = 280 }: Props = $props();

let canvasElement: HTMLCanvasElement;
let chartInstance: Chart | null = null;

// Color overrides supplied by the consumer (e.g. fixed white data labels) must
// win over the theme defaults applied below.
let userDatalabelsColor = $derived((options as ChartOptions)?.plugins?.datalabels?.color ?? null);

function buildOptions(): ChartOptions {
	return {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 800, easing: 'easeOutQuart' },
		font: { family: 'Inter, system-ui, sans-serif' },
		...(options as ChartOptions),
	};
}

function applyThemeColors(theme: string): void {
	if (!chartInstance) return;

	const isDark = theme === 'dark';
	const plugins = chartInstance.options.plugins;

	if (plugins?.legend?.labels) {
		plugins.legend.labels.color = isDark ? '#a0a0a0' : '#666666';
	}
	if (plugins?.tooltip) {
		plugins.tooltip.backgroundColor = isDark ? '#1a1c23' : '#ffffff';
		plugins.tooltip.titleColor = isDark ? '#e0e0e0' : '#333333';
		plugins.tooltip.bodyColor = isDark ? '#a0a0a0' : '#666666';
		plugins.tooltip.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
	}
	if (plugins?.datalabels && !userDatalabelsColor) {
		(plugins.datalabels as { color?: string }).color = isDark ? '#e0e0e0' : '#333333';
	}

	const scales = chartInstance.options.scales;
	if (scales?.x?.ticks) {
		scales.x.ticks.color = isDark ? '#a0a0a0' : '#666666';
	}
	if (scales?.y?.ticks) {
		scales.y.ticks.color = isDark ? '#a0a0a0' : '#666666';
	}

	chartInstance.update('none');
}

$effect(() => {
	const canvas = canvasElement;
	if (!canvas) return;

	// Snapshot the props before awaiting so the effect still tracks them.
	const chartType = type;
	const chartData = data;
	const chartOptions = buildOptions();
	let cancelled = false;

	void (async () => {
		const chartJs = await loadChart();
		if (cancelled || !canvas.isConnected) return;

		chartInstance?.destroy();
		chartInstance = new chartJs.Chart(canvas, {
			type: chartType,
			data: chartData,
			options: chartOptions,
		});

		// Read the theme untracked so theme changes repaint via the effect below
		// instead of tearing down and rebuilding the whole chart.
		applyThemeColors(untrack(() => appStore.theme));
	})();

	return () => {
		cancelled = true;
		chartInstance?.destroy();
		chartInstance = null;
	};
});

$effect(() => {
	const theme = appStore.theme;
	if (!chartInstance) return;
	applyThemeColors(theme);
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
