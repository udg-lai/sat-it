<script lang="ts">
	import './_style.css';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, userActionEventBus } from '$lib/transversal/events.ts';
	import { updateAssignment } from '$lib/store/assignment.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { logInfo } from '$lib/store/toasts.ts';

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

	let userLiteral: number | undefined = $state(undefined);

	// -----Code related to checking manual decisions-----
	const { variables }: Problem = $derived(getProblemStore());

	let max: number = $derived(variables.size());
	let min: number = $derived(max * -1);

	let isVariableValid: boolean = $derived.by(() => {
		if (userLiteral === undefined) return false;
		else {
			if (userLiteral < min || userLiteral > max || userLiteral === 0) return false;
			else {
				const assignedVariables = variables.assignedVariables();
				return !assignedVariables.includes(Math.abs(userLiteral));
			}
		}
	});

	const validateInput = (event: Event): void => {
		const input: HTMLInputElement = event.target as HTMLInputElement;

		if (input.value === '-') {
			return;
		}

		if (input.value === '') {
			userLiteral = undefined;
			return;
		}

		const value: number = Number(input.value);

		if (isNaN(value)) {
			userLiteral = undefined;
			input.value = '';
			return;
		}

		if (value < min || value > max || value === 0) {
			userLiteral = undefined;
			input.setCustomValidity(`Valid variable in [${min} : ${max}] except zero`);
			input.reportValidity();
			return;
		} else {
			input.setCustomValidity('');
		}

		userLiteral = value;
	};

	//It can happen that a user enters a '-' without anything else and we'll have to clean the input if necessary.
	const checkMinus = () => {
		if (userLiteral !== undefined && userLiteral.toString() === '-') {
			userLiteral = undefined;
		}
	};

	const emitAssignment = (): void => {
		if (userLiteral === undefined) {
			updateAssignment('automated');
			stateMachineEventBus.emit('step');
			userActionEventBus.emit('record');
		} else {
			if (!isVariableValid) {
				logInfo('Manual assignment error', `Variable ${Math.abs(userLiteral)} already assigned`);
			} else {
				console.log(userLiteral);
				const polarity: boolean = userLiteral > 0;
				const userNextVariable: number = Math.abs(userLiteral);
				updateAssignment('manual', polarity, userNextVariable as number);
				stateMachineEventBus.emit('step');
				userActionEventBus.emit('record');
			}
			userLiteral = undefined;
		}
	};
</script>

<decision-debugger>
	<div class="join-variable">
		{#if nextLiteral !== undefined}
			<div class="next-variable">
				<input
					type="text"
					class="variable-input"
					bind:value={userLiteral}
					oninput={validateInput}
					onchange={checkMinus}
					placeholder={nextLiteral.toString()}
					{max}
				/>
			</div>
		{:else}
			<div class="next-variable" class:conflict={onConflict}></div>
		{/if}

		{#if !onConflict}
			<button
				class="btn general-btn next-button"
				class:invalidOption={finished || onConflictDetection}
				onclick={() => {
					emitAssignment();
				}}
				title="Decide"
				disabled={finished || onConflictDetection}
			>
				<DynamicRender component={CaretRightOutline} props={assignmentProps} />
			</button>
		{:else}
			<button
				class="btn general-btn bkt-btn next-button"
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
	</div>
</decision-debugger>

<style>
	decision-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.next-variable {
		display: flex;
		width: var(--variable-input-width);
		height: var(--button-size);
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
		background-color: var(--button-color);
		border-color: var(--button-border-color);
	}

	input {
		outline: none;
	}

	input:focus {
		outline: none;
	}

	.variable-input {
		border-radius: 6px 0px 0px 6px;
		width: var(--variable-input-width);
		height: var(--button-size);
		background-color: transparent;
		border: none;
	}

	:global(.variable-input:focus) {
		outline: none;
		box-shadow: none;
	}

	.join-variable {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next-button {
		border-radius: 0 6px 6px 0;
		border-left: none;
	}

	.conflict {
		color: var(--conflict-color);
		border: 1px dashed var(--conflict-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
	}
</style>
