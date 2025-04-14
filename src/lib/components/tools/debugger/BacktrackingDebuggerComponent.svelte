<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import { logInfo } from '$lib/transversal/utils/logging.ts';
	import { emitAssignmentEvent } from './events.svelte.ts';

	let polarity: boolean = $state(true);
	let positive: boolean = $derived(polarity);
	let maxValue: number = $derived($problemStore.variables.nVariables());

	let defaultNextVariable = $derived($problemStore.variables.nextVariable);
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
				emitAssignmentEvent({ type: 'automated' });
			} else {
				if (userNextVariable === defaultNextVariable && positive) {
					emitAssignmentEvent({ type: 'automated' });
				} else {
					emitAssignmentEvent({ type: 'manual', variable: userNextVariable, polarity: positive });
					userNextVariable = undefined;
				}
			}
		}
		userNextVariable = undefined;
	}
</script>

<div class="pack mb-1 flex flex-row items-center gap-2">
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

	<div class="flex w-[4.5rem] shrink-0 flex-col justify-between gap-1">
		<button
			class="polarity"
			class:positive
			onclick={() => (polarity = true)}
			disabled={defaultNextVariable === undefined}
		>
			<h1>True</h1>
		</button>
		<button
			class="polarity"
			class:positive={!positive}
			onclick={() => (polarity = false)}
			disabled={defaultNextVariable === undefined}
		>
			<h1>False</h1>
		</button>
	</div>
	{#if defaultNextVariable}
		<button
			class="btn w-[10rem] shrink-0"
			class:invalidOption={!isVariableValid}
			onclick={() => emitAssignment()}
		>
			<h1>Decide</h1>
		</button>
	{:else}
		<button
			class="btn w-[10rem] shrink-0"
			onclick={() => emitAssignmentEvent({ type: 'automated' })}
		>
			<h1>FIX</h1>
		</button>
	{/if}
</div>
