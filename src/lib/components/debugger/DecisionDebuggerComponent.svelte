<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';
	import { logInfo, logWarning } from '$lib/stores/toasts.ts';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import './style.css';

	const assignmentProps = {
		size: 'md'
	};

	interface Props {
		onConflict: boolean;
		finished: boolean;
		onConflictDetection: boolean;
		nextLiteral: number | undefined;
	}

	let { onConflict, finished, onConflictDetection, nextLiteral }: Props = $props();

	let inputLiteral: number | undefined = $state(undefined);

	// -----Code related to checking manual decisions-----
	const { variables }: Problem = $derived(getProblemStore());

	let max: number = $derived(variables.size());
	let min: number = $derived(max * -1);

	const handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Enter') {
			validateInput(event);
			emitAssignment(inputLiteral);
		}
	};

	const validateInput = (event: Event): void => {
		const input: HTMLInputElement = event.target as HTMLInputElement;

		if (input.value === '-') {
			return;
		}

		if (input.value === '') {
			inputLiteral = undefined;
			return;
		}

		const literal: number = Number(input.value);

		if (isNaN(literal)) {
			inputLiteral = undefined;
			input.value = '';
			return;
		}

		if (literal < min || literal > max || literal === 0) {
			inputLiteral = undefined;
			const variable: number = Math.abs(literal);
			logInfo(
				'Manual assignment',
				`The variable '${variable}' is not defined in the problem context.`
			);
			return;
		}

		// Only "possible" variable assignment
		inputLiteral = literal;
	};

	//It can happen that a user enters just a '-', which it's an invalid "final input", so it needs to be cleaned.
	const checkForMinus = () => {
		if (inputLiteral !== undefined && inputLiteral.toString() === '-') {
			inputLiteral = undefined;
		}
	};

	const alreadyAssignedTruthValue = (literal: number): boolean => {
		const variable = Math.abs(literal);
		return variables.assignedTruthValue(variable);
	};

	const emitAssignment = (literal: number | undefined): void => {
		if (literal === undefined) {
			updateAssignment('automated');
			stateMachineEventBus.emit('step');
		} else {
			if (alreadyAssignedTruthValue(literal)) {
				const variable: number = Math.abs(literal);
				logWarning(
					'Manual assignment',
					`Variable '${variable}' has already been assigned with a truth value.`
				);
			} else {
				const truthValue: boolean = literal > 0;
				const variable: number = Math.abs(literal);
				updateAssignment('manual', truthValue, variable);
				stateMachineEventBus.emit('step');
			}
			inputLiteral = undefined;
		}
	};
</script>

<decision-debugger>
	<div class="join-variable">
		{#if !onConflict}
			<button
				class="btn general-btn join-right"
				class:invalidOption={finished || onConflictDetection}
				onclick={() => {
					emitAssignment(inputLiteral);
				}}
				title="Decide"
				disabled={finished || onConflictDetection}
			>
				<DynamicRender component={CaretRightOutline} props={assignmentProps} />
			</button>
		{:else}
			<button
				class="btn general-btn conflict-btn join"
				class:invalidOption={finished || onConflictDetection}
				onclick={() => {
					stateMachineEventBus.emit('step');
				}}
				title="Backtrack"
				disabled={finished || onConflictDetection}
			>
				<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
			</button>
		{/if}
		{#if nextLiteral !== undefined}
			<div class="next-variable join-left">
				<input
					type="text"
					class="variable-input"
					bind:value={inputLiteral}
					oninput={validateInput}
					onkeydown={handleKeyDown}
					onchange={checkForMinus}
					placeholder={nextLiteral.toString()}
					{max}
				/>
			</div>
		{/if}
	</div>
</decision-debugger>

<style>
	decision-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.join-variable {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.next-variable {
		display: flex;
		width: var(--variable-input-width);
		height: var(--button-size);
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-color);
		background-color: var(--button-color);
		border-color: var(--button-border-color);
	}

	.variable-input {
		width: var(--variable-input-width);
		height: var(--button-size);
		background-color: transparent;
		border: none;
		text-align: end;
	}

	.variable-input:focus {
		outline: none;
		box-shadow: none;
	}

	.join-right {
		border-radius: 6px 0px 0px 6px;
		border-right: none;
		box-shadow: none;
	}

	.join-left {
		border-radius: 0 6px 6px 0;
		border-left: none;
	}

	.join {
		border-radius: 6px;
	}
</style>
