<script lang="ts">
	import { logError, logInfo } from '$lib/transversal/utils/logging.ts';

	import { Modal } from 'flowbite-svelte';
	import { emitActionEvent, emitAssignmentEvent } from './events.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import {
		CaretRightOutline,
		CheckCircleOutline,
		CircleMinusOutline,
		PenOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';

	interface Props {
		defaultNextVariable: number | undefined;
	}

	let { defaultNextVariable }: Props = $props();

	const generalProps = {
		class: 'h-8 w-8'
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

	export function emitAssignment() {
		if (!isVariableValid) {
			logInfo('Invalid Variable', 'The variable you are trying to assign is already assigned');
		} else {
			if (
				(userNextVariable === undefined && polarity) ||
				(userNextVariable !== undefined && userNextVariable === defaultNextVariable && polarity)
			) {
				emitAssignmentEvent({ type: 'automated' });
			} else if (defaultNextVariable !== undefined && userNextVariable === undefined && !polarity) {
				emitAssignmentEvent({ type: 'manual', variable: defaultNextVariable, polarity: polarity });
			} else if (userNextVariable !== undefined) {
				emitAssignmentEvent({ type: 'manual', variable: userNextVariable, polarity: polarity });
			} else {
				logError('Could not control case of assignment');
			}
		}
		emitActionEvent({ type: 'record' });
		resetState();
	}

	function resetState(): void {
		userNextVariable = undefined;
		polarity = true;
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={defaultNextVariable === undefined}
	title="Manual Decision"
	onclick={() => (manualDecisionModal = true)}
	disabled={defaultNextVariable === undefined}
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
			placeholder={defaultNextVariable
				? defaultNextVariable.toString()
				: 'No more variables to assign'}
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
