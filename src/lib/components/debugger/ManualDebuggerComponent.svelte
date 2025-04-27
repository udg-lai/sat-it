<script lang="ts">
	import { logError, logInfo } from '$lib/transversal/utils/logging.ts';

	import { Modal } from 'flowbite-svelte';
	import { emitAssignmentEvent } from './events.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import {
		CaretRightOutline,
		CheckCircleOutline,
		CircleMinusOutline,
		PenOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { isUnresolved, type Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';

	interface Props {
		previousEval: Eval;
	}

	let { previousEval }: Props = $props();

	const generalProps = {
		class: 'h-8 w-8 cursor-pointer'
	};

	let manualDecisionModal = $state(false);
	let polarity: boolean = $state(true);
	let maxValue: number = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nVariables();
		else return 0;
	});

	let userNextVariable: number | undefined = $state(undefined);

	let isVariableValid: boolean = $derived.by(() => {
		if (userNextVariable === undefined) return true;
		else {
			if (userNextVariable < 1 || userNextVariable > maxValue) return false;
			else {
				const assignedVariables = $problemStore.variables.assignedVariables();
				return !assignedVariables.includes(userNextVariable);
			}
		}
	});

	function emitAssignment() {
		if (!isVariableValid) {
			logInfo('Invalid Variable', 'The variable you are trying to assign is already assigned');
		} else {
			if (userNextVariable === undefined) {
				logError('Ther is no user variable to decide');
			} else {
				emitAssignmentEvent({ type: 'manual', variable: userNextVariable, polarity: polarity });
			}
		}
		resetState();
	}

	function resetState(): void {
		userNextVariable = undefined;
		polarity = true;
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={!isUnresolved(previousEval)}
	title="Manual Decision"
	onclick={() => (manualDecisionModal = true)}
	disabled={!isUnresolved(previousEval)}
>
	<DynamicRender component={PenOutline} props={generalProps} />
</button>

<Modal bind:open={manualDecisionModal} size="xs" outsideclose class="manual-decision">
	<div class="flex items-center gap-2">
		<span>Variable:</span>
		<input
			bind:value={userNextVariable}
			type="number"
			class="variable-selector w-[128px]"
			class:invalidOption={!isVariableValid}
			placeholder={'Var?'}
			min="1"
			max={maxValue}
		/>
	</div>

	<div class="flex gap-2">
		<button
			class="polarity"
			class:active={polarity}
			onclick={() => (polarity = true)}
			title="Set true"
		>
			<DynamicRender component={CheckCircleOutline} props={generalProps} />
		</button>

		<button
			class="polarity"
			class:active={!polarity}
			onclick={() => (polarity = false)}
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
			disabled={!userNextVariable}
			title="Decide"
		>
			<DynamicRender component={CaretRightOutline} props={generalProps} />
		</button>
	</div>
</Modal>
