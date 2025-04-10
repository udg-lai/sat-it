<script lang="ts">
	import {
		followingVariable,
		nonAssignedVariables,
		updateFollowingVariable
	} from '$lib/store/debugger.store.ts';
	import { fromJust, isJust } from '$lib/transversal/utils/types/maybe.ts';
	import { onMount } from 'svelte';
	import { emitAssignmentEvent, type Manual } from './events.svelte.ts';
	import './style.css';
	import { problemStore } from '$lib/store/problem.store.ts';

	let polarity: boolean = $state(true);
	let positive: boolean = $derived(polarity);
	const maxValue: number = $derived($problemStore.pools.variables.nVariables());

	let isVariableValid: boolean = $derived(
		isJust($followingVariable) && $nonAssignedVariables.includes($followingVariable.value)
	);

	function emitAssignment(){
		const userVariable = fromJust($followingVariable);
		const nextVariable = fromJust($problemStore.pools.variables.nextVariableToAssign());
		if( userVariable === nextVariable  && positive) {
			emitAssignmentEvent('Automated')
		}
		else {
			emitAssignmentEvent({variable: $followingVariable.value, polarity: positive} as Manual);
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
			disabled={!isVariableValid}
		>
			<h1>Decide</h1>
		</button>
	{:else}
		<button
			class="btn w-[10rem] shrink-0"
			onclick={() => emitAssignmentEvent('Automated')}
		>
			<h1>FIX</h1>
		</button>
	{/if}
</div>
