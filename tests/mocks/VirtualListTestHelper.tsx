import type { JSX } from '@solidjs/web';
import VirtualList from '#lib/components/VirtualList.js';

interface Item {
	id: string;
	text: string;
}

export interface VirtualListTestHelperProps {
	items: Item[];
	itemHeight?: number;
	containerHeight?: number;
	overscan?: number;
}

const keyExtractor = (item: Item): string => item.id;

export default function VirtualListTestHelper(props: VirtualListTestHelperProps): JSX.Element {
	return (
		<VirtualList
			items={props.items}
			itemHeight={props.itemHeight ?? 100}
			containerHeight={props.containerHeight ?? 300}
			overscan={props.overscan ?? 2}
			keyExtractor={keyExtractor}
			renderItem={(item, isPriority) => <div class={['test-item', { priority: isPriority }]}>{item.text}</div>}
		/>
	);
}
