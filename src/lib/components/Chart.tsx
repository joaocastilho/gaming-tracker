import type { JSX } from '@solidjs/web';
import type { Chart, ChartData, ChartOptions, ChartType } from 'chart.js';
import { createEffect, createMemo, createSignal, untrack } from 'solid-js';
import { appStore } from '#lib/stores/app.js';
import './Chart.css';

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

export interface ChartProps {
	type: ChartType;
	data: ChartData;
	options?: Record<string, unknown>;
	height?: number;
}

export default function ChartComponent(props: ChartProps): JSX.Element {
	const [canvasEl, setCanvasEl] = createSignal<HTMLCanvasElement | null>(null);
	let chartInstance: Chart | null = null;

	const height = createMemo(() => props.height ?? 280);
	const userDatalabelsColor = createMemo(
		() => (props.options as ChartOptions | undefined)?.plugins?.datalabels?.color ?? null
	);

	function buildOptions(opts: Record<string, unknown> | undefined): ChartOptions {
		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 800, easing: 'easeOutQuart' },
			font: { family: 'Inter, system-ui, sans-serif' },
			...(opts as ChartOptions),
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
		if (plugins?.datalabels && !untrack(userDatalabelsColor)) {
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

	createEffect(
		() => ({
			canvas: canvasEl(),
			type: props.type,
			data: props.data,
			options: props.options,
		}),
		({ canvas, type, data, options }) => {
			if (!canvas) return;
			const chartOptions = buildOptions(options);
			let cancelled = false;

			void (async () => {
				const chartJs = await loadChart();
				if (cancelled || !canvas.isConnected) return;

				chartInstance?.destroy();
				chartInstance = new chartJs.Chart(canvas, {
					type,
					data,
					options: chartOptions,
				});

				applyThemeColors(untrack(() => appStore.theme));
			})();

			return () => {
				cancelled = true;
				chartInstance?.destroy();
				chartInstance = null;
			};
		}
	);

	createEffect(
		() => appStore.theme,
		(theme) => {
			if (!chartInstance) return;
			applyThemeColors(theme);
		}
	);

	return (
		<div class="chart-wrapper" style={{ height: `${height()}px` }}>
			<canvas ref={setCanvasEl} />
		</div>
	);
}
