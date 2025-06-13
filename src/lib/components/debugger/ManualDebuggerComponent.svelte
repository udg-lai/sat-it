<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { logInfo } from '$lib/store/toasts.ts';
	import { Modal } from 'flowbite-svelte';
	import {
		CaretRightOutline,
		CheckCircleOutline,
		CircleMinusOutline,
		PenOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { stateMachineEventBus, userActionEventBus } from '$lib/transversal/events.ts';
	import { updateAssignment } from '$lib/store/assignment.svelte.ts';

	interface Props {
		defaultNextVariable: number | undefined;
		finished: boolean;
		onConflict: boolean;
	}

	let { defaultNextVariable, finished, onConflict }: Props = $props();

	const generalProps = {
		size: 'md'
	};
	const problem: Problem = $derived(getProblemStore());
	let manualDecisionModal = $state(false);
	let polarity: boolean = $state(true);
	let maxValue: number = $derived(problem.variables.nVariables());

	let userNextVariable: number | undefined = $state(defaultNextVariable);

	let isVariableValid: boolean = $derived.by(() => {
		if (userNextVariable === undefined) return false;
		else {
			if (userNextVariable < 1 || userNextVariable > maxValue) return false;
			else {
				const assignedVariables = problem.variables.assignedVariables();
				return !assignedVariables.includes(userNextVariable);
			}
		}
	});

	export function emitAssignment() {
		if (!isVariableValid) {
			logInfo('Invalid Variable', 'The variable you are trying to assign is already assigned');
		} else {
			updateAssignment('manual', polarity, userNextVariable as number);
			stateMachineEventBus.emit('step');
			userActionEventBus.emit('record');
			resetState();
		}
	}

	function resetState(): void {
		userNextVariable = undefined;
		polarity = true;
	}
</script>

<manual-debugger>
	<button
		class="btn general-btn"
		class:invalidOption={defaultNextVariable === undefined || finished || onConflict}
		title="Manual Decision"
		onclick={() => (manualDecisionModal = true)}
		disabled={defaultNextVariable === undefined || finished || onConflict}
	>
		<DynamicRender component={PenOutline} props={generalProps} />
	</button>

	<Modal bind:open={manualDecisionModal} size="xs" outsideclose class="manual-decision">
		<div class="flex items-center gap-2">
			<span>Variable:</span>
			<input
				bind:value={userNextVariable}
				placeholder={defaultNextVariable ? defaultNextVariable.toString() : 'X'}
				type="number"
				class="variable-selector w-[128px]"
				class:invalidOption={!isVariableValid}
				disabled={defaultNextVariable === undefined}
				min="1"
				max={maxValue}
			/>
		</div>

		<div class="flex gap-2">
			<button
				class="polarity"
				class:active={polarity}
				onclick={() => (polarity = true)}
				disabled={defaultNextVariable === undefined}
				title="Set true"
			>
				<DynamicRender component={CheckCircleOutline} props={generalProps} />
			</button>

			<button
				class="polarity"
				class:active={!polarity}
				onclick={() => (polarity = false)}
				disabled={defaultNextVariable === undefined}
				title="Set false"
			>
				<DynamicRender component={CircleMinusOutline} props={generalProps} />
			</button>
		</div>

		<div class="flex justify-end">
			<button
				class="btn manual-button"
				class:invalidOption={!isVariableValid}
				onclick={() => {
					emitAssignment();
					manualDecisionModal = false;
				}}
				title="Decide"
			>
				<DynamicRender component={CaretRightOutline} props={generalProps} />
			</button>
		</div>
	</Modal>
</manual-debugger>

<style>
	manual-debugger {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
