<script lang="ts">
	import type { Game } from '../../types/game.js';

	interface Props {
		working: Game;
		hours: number;
		minutes: number;
		dateInput: string;
		completionOrderInput: number | null;
		onHoursChange: (hours: number) => void;
		onMinutesChange: (minutes: number) => void;
		onDateChange: (date: string) => void;
		onCompletionOrderChange: (order: number | null) => void;
	}

	let {
		working,
		hours,
		minutes,
		dateInput,
		completionOrderInput,
		onHoursChange,
		onMinutesChange,
		onDateChange,
		onCompletionOrderChange
	}: Props = $props();

	function handleCoOpToggle(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		working.coOp = checked ? 'Yes' : 'No';
	}
</script>

<div class="metadata-section">
	<div class="form-row time-row">
		<div class="form-group time-group">
			<label>Playtime</label>
			<div class="time-inputs">
				<input
					type="number"
					min="0"
					max="999"
					value={hours}
					oninput={(e) => onHoursChange(parseInt(e.currentTarget.value) || 0)}
				/>
				<span>h</span>
				<input
					type="number"
					min="0"
					max="59"
					value={minutes}
					oninput={(e) => onMinutesChange(parseInt(e.currentTarget.value) || 0)}
				/>
				<span>m</span>
			</div>
		</div>

		{#if working.status === 'Completed'}
			<div class="form-group">
				<label for="finishedDate">Finished Date</label>
				<input
					id="finishedDate"
					type="date"
					value={dateInput}
					oninput={(e) => onDateChange(e.currentTarget.value)}
				/>
			</div>

			<div class="form-group">
				<label for="completionOrder">Completion Order</label>
				<input
					id="completionOrder"
					type="number"
					min="1"
					value={completionOrderInput ?? ''}
					oninput={(e) =>
						onCompletionOrderChange(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
				/>
			</div>
		{/if}
	</div>

	<div class="form-row">
		<label class="checkbox-simple">
			<input type="checkbox" checked={working.coOp === 'Yes'} onchange={handleCoOpToggle} />
			<span>Co-op Available</span>
		</label>
	</div>
</div>

<style>
	.metadata-section {
		margin-top: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-row.time-row {
		align-items: flex-end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.time-group {
		flex: 0 0 auto;
	}

	label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.time-inputs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.time-inputs input {
		width: 60px;
		text-align: center;
	}

	.time-inputs span {
		color: #94a3b8;
		font-size: 0.875rem;
	}

	input[type='text'],
	input[type='number'],
	input[type='date'] {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	.checkbox-simple {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem 0;
		height: 38px;
	}

	.checkbox-simple input[type='checkbox'] {
		-webkit-appearance: none;
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		background-color: #0f172a;
		border: 1px solid rgba(75, 85, 99, 0.4);
		border-radius: 4px;
		display: grid;
		place-content: center;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.checkbox-simple input[type='checkbox']:checked {
		background-color: #6366f1;
		border-color: #6366f1;
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 80%;
	}

	.checkbox-simple span {
		color: #e5e7eb;
		font-size: 0.9rem;
	}
</style>
