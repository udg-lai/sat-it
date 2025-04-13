<script lang="ts">
	import {
		followingVariable,
		assignedVariables,
		updateFollowingVariable
	} from '$lib/store/debugger.store.ts';
	import { fromJust, isJust } from '$lib/transversal/utils/types/maybe.ts';
	import { onMount } from 'svelte';
	import { emitAssignmentEvent, type Manual } from './events.svelte.ts';
	import './style.css';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { logInfo } from '$lib/transversal/utils/logging.ts';

	let polarity: boolean = $state(true);
	let positive: boolean = $derived(polarity);
	const maxValue: number = $derived($problemStore.pools.variables.nVariables());

	let isVariableValid: boolean = $derived(
		isJust($followingVariable) && !$assignedVariables.includes($followingVariable.value)
	);

	function emitAssignment() {
		if (isVariableValid) {
			const userVariable = fromJust($followingVariable);
			const algorithmVariable = fromJust($problemStore.pools.variables.nextVariableToAssign());
			if (userVariable === algorithmVariable && positive) {
				emitAssignmentEvent('Automated');
			} else {
				emitAssignmentEvent({ variable: userVariable, polarity: positive } as Manual);
				polarity = true;
			}
		} else {
			logInfo('Invalid Variable', 'The variable you are trying to assign is already assigned');
		}
	}

	onMount(() => {
		updateFollowingVariable();
	});
</script>

<div class="pack mb-1 flex flex-row items-center gap-2">
	{#if isJust($followingVariable)}
		<span>Variable:</span>
		<input
			type="number"
			class="variable-selector min-w-0 flex-grow"
			class:invalidOption={!isVariableValid}
			bind:value={$followingVariable.value}
			placeholder="Enter variable"
			min="1"
			max={maxValue}
		/>
	{:else}
		<span class="min-w-0 flex-grow">No more variables to assign</span>
	{/if}

	<div class="flex w-[4.5rem] shrink-0 flex-col justify-between gap-1">
		<button class="polarity" class:positive onclick={() => (polarity = true)}>
			<h1>True</h1>
		</button>
		<button class="polarity" class:positive={!positive} onclick={() => (polarity = false)}>
			<h1>False</h1>
		</button>
	</div>
	{#if isJust($followingVariable)}
		<button
			class="btn w-[10rem] shrink-0"
			class:invalidOption={!isVariableValid}
			onclick={() => emitAssignment()}
		>
			<h1>Decide</h1>
		</button>
	{:else}
		<button class="btn w-[10rem] shrink-0" onclick={() => emitAssignmentEvent('Automated')}>
			<h1>FIX</h1>
		</button>
	{/if}
</div>
