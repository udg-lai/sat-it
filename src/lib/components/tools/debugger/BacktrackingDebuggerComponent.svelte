<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import { logError, logInfo } from '$lib/transversal/utils/logging.ts';
	import {
		CheckCircleSolid,
		CircleMinusSolid,
		HammerSolid,
		PlaySolid
	} from 'flowbite-svelte-icons';
	import { emitAssignmentEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';

	let polarity: boolean = $state(true);
	let maxValue: number = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nVariables();
		else return 0;
	});

	let defaultNextVariable = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
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

	const polarityProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

	const assignmentProps = {
		class: 'h-10 w-10 cursor-pointer'
	};

	function emitAssignment() {
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
		resetState();
	}

	function resetState(): void {
		userNextVariable = undefined;
		polarity = true;
	}
</script>

<div class="flex h-full flex-row gap-2">
	<div class="mb-2 mt-2 flex flex-[3] flex-row items-center justify-center">
		<span>Variable:</span>
		<input
			bind:value={userNextVariable}
			type="number"
			class="variable-selector min-w-0 flex-grow"
			class:invalidOption={!isVariableValid}
			placeholder={defaultNextVariable
				? defaultNextVariable.toString()
				: 'No more variables to assign'}
			disabled={defaultNextVariable === undefined}
			min="1"
			max={maxValue}
		/>

		<div class="m-2 flex h-full flex-1 flex-col items-center justify-center gap-2">
			<button
				class="polarity flex w-full flex-1 items-center justify-center"
				class:active={polarity}
				onclick={() => (polarity = true)}
				disabled={defaultNextVariable === undefined}
			>
				<DynamicRender component={CheckCircleSolid} props={polarityProps} />
			</button>

			<button
				class="polarity flex w-full flex-1 items-center justify-center"
				class:active={!polarity}
				onclick={() => (polarity = false)}
				disabled={defaultNextVariable === undefined}
			>
				<DynamicRender component={CircleMinusSolid} props={polarityProps} />
			</button>
		</div>
	</div>
	<div class="mb-2 mt-2 flex flex-[1] items-center justify-center">
		{#if defaultNextVariable}
			<button
				class="btn flex h-full w-full items-center justify-center"
				class:invalidOption={!isVariableValid}
				onclick={() => emitAssignment()}
			>
				<DynamicRender component={PlaySolid} props={assignmentProps} />
			</button>
		{:else}
			<button
				class="btn flex h-full w-full items-center justify-center"
				onclick={() => emitAssignmentEvent({ type: 'automated' })}
			>
				<DynamicRender component={HammerSolid} props={assignmentProps} />
			</button>
		{/if}
	</div>
</div>
