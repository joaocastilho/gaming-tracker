import { Users } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { filtersStore } from '#lib/stores/filters.js';
import './FilterToggle.css';

export interface FilterToggleProps {
	label: string;
	value: string;
	isSelected: boolean;
}

export default function FilterToggle(props: FilterToggleProps): JSX.Element {
	function toggle(): void {
		filtersStore.toggleCoOp(props.value);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	}

	return (
		<button
			type="button"
			class={[
				'filter-toggle flex items-center gap-2 px-1 py-2 text-sm transition-colors',
				props.isSelected ? 'selected' : 'text-muted-foreground hover:text-foreground',
			]}
			onClick={toggle}
			onKeyDown={handleKeydown}
			aria-pressed={props.isSelected ? 'true' : 'false'}
			aria-label={`Toggle ${props.label} filter`}
		>
			<Users size={16} class={props.isSelected ? 'text-blue-500' : 'text-muted-foreground'} />
			<span class={['filter-label', { 'text-blue-500': props.isSelected }]}>{props.label}</span>
		</button>
	);
}
