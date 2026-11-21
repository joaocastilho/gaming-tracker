import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { windowSize } from '#lib/stores/window.js';
import { safeKeyExtractor } from '#lib/utils/safeKeyExtractor.js';
import { binarySearchEnd, binarySearchStart } from '#lib/utils/virtualScroll.js';
import './VirtualList.css';

export interface VirtualListProps<T> {
	items: T[];
	itemHeight?: number;
	containerHeight?: number;
	overscan?: number;
	renderItem: (item: T, isPriority: boolean) => JSX.Element;
	keyExtractor: (item: T, index: number) => string | number;
	className?: string;
	priorityCount?: number;
	useWindowScroll?: boolean;
	getItemHeight?: (index: number) => number;
}

export default function VirtualList<T>(props: VirtualListProps<T>): JSX.Element {
	const [container, setContainer] = createSignal<HTMLDivElement | null>(null);
	const [scrollTop, setScrollTop] = createSignal(0);
	const [containerTop, setContainerTop] = createSignal(0);
	let scrollTicking = false;

	const itemHeight = createMemo(() => props.itemHeight ?? 200);
	const containerHeight = createMemo(() => props.containerHeight ?? 600);
	const overscan = createMemo(() => props.overscan ?? 5);
	const priorityCount = createMemo(() => props.priorityCount ?? 6);
	const useWindowScroll = createMemo(() => props.useWindowScroll ?? false);
	const hasVariableHeights = createMemo(() => typeof props.getItemHeight === 'function');

	function updateContainerPosition(): void {
		const el = container();
		if (useWindowScroll() && el) {
			const rect = el.getBoundingClientRect();
			setContainerTop(rect.top + window.scrollY);
		}
	}

	const offsets = createMemo<number[] | null>(() => {
		const getH = props.getItemHeight;
		if (typeof getH !== 'function') return null;
		const arr: number[] = [0];
		const list = props.items ?? [];
		for (let i = 0; i < list.length; i++) {
			const h = getH(i);
			arr.push((arr[i] ?? 0) + h);
		}
		return arr;
	});

	const totalHeight = createMemo(() => {
		const offs = offsets();
		if (hasVariableHeights() && offs) return offs[offs.length - 1] ?? 0;
		return (props.items ?? []).length * itemHeight();
	});

	const visibleRange = createMemo(() => {
		const list = props.items ?? [];
		const effectiveHeight = useWindowScroll() ? windowSize.height : containerHeight();
		const offs = offsets();
		const top = scrollTop();
		const over = overscan();

		if (hasVariableHeights() && offs) {
			const start = Math.max(0, binarySearchStart(offs, top) - over);
			const end = Math.min(list.length, binarySearchEnd(offs, top + effectiveHeight, list.length) + over);
			return { start, end };
		}

		const h = itemHeight();
		const start = Math.max(0, Math.floor(top / h) - over);
		const end = Math.min(list.length, Math.ceil((top + effectiveHeight) / h) + over);
		return { start, end };
	});

	const visibleItems = createMemo(() => {
		const range = visibleRange();
		const list = props.items ?? [];
		return list.slice(range.start, range.end).map((item, idx) => {
			const index = range.start + idx;
			return {
				item,
				index,
				key: safeKeyExtractor(item, index, props.keyExtractor),
			};
		});
	});

	function handleScroll(): void {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(() => {
			if (useWindowScroll()) {
				const offset = window.scrollY - containerTop();
				setScrollTop(Math.max(0, offset));
			} else {
				const el = container();
				if (el) setScrollTop(el.scrollTop);
			}
			scrollTicking = false;
		});
	}

	createEffect(
		() => ({ winScroll: useWindowScroll(), el: container() }),
		({ winScroll, el }) => {
			if (!winScroll) return;

			const updateDimensions = () => {
				if (typeof window !== 'undefined') updateContainerPosition();
			};
			updateDimensions();

			window.addEventListener('scroll', handleScroll, { passive: true });
			window.addEventListener('resize', updateDimensions);

			let scheduled = false;
			const resizeObserver = new ResizeObserver(() => {
				if (scheduled) return;
				scheduled = true;
				requestAnimationFrame(() => {
					updateContainerPosition();
					scheduled = false;
				});
			});

			if (el) {
				const parent = el.parentElement;
				resizeObserver.observe(parent ?? el);
			}

			return () => {
				window.removeEventListener('scroll', handleScroll);
				window.removeEventListener('resize', updateDimensions);
				resizeObserver.disconnect();
			};
		}
	);

	const itemsTopPx = createMemo(() => {
		const offs = offsets();
		const start = visibleRange().start;
		return hasVariableHeights() && offs ? `${offs[start] ?? 0}px` : `${start * itemHeight()}px`;
	});

	return (
		<div
			ref={setContainer}
			class={['virtual-list-container', props.className]}
			style={
				useWindowScroll()
					? { height: `${totalHeight()}px`, position: 'relative' }
					: { height: `${containerHeight()}px`, 'overflow-y': 'auto', position: 'relative' }
			}
			onScroll={() => {
				if (!useWindowScroll()) handleScroll();
			}}
		>
			<Show when={!useWindowScroll()}>
				<div class="virtual-spacer" style={{ height: `${totalHeight()}px`, position: 'relative' }} />
			</Show>

			<div
				class="virtual-items"
				style={{
					position: 'absolute',
					top: itemsTopPx(),
					left: '0',
					right: '0',
				}}
			>
				<For each={visibleItems()}>
					{(entry) => (
						<div
							class="virtual-item"
							data-key={String(entry.key)}
							style={
								hasVariableHeights() && props.getItemHeight
									? { height: `${props.getItemHeight(entry.index)}px` }
									: undefined
							}
						>
							{props.renderItem(entry.item, entry.index < priorityCount())}
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
