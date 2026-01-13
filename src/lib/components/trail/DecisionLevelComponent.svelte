<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { differOf } from '$lib/states/trail-differ-sequence.svelte.ts';
	import type { ComposedTrail } from '$lib/types/types.ts';
	import { onMount } from 'svelte';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import { toggleTrailExpandEventBus } from '$lib/events/events.ts';

	interface Props {
		composedTrail: ComposedTrail;
		decision: VariableAssignment;
		propagations?: VariableAssignment[];
		emitRevertUpToX: () => void;
	}

	let { composedTrail, decision, propagations = [], emitRevertUpToX }: Props = $props();

	let expanded = $state(true)

	const emitToggle = (decisionState: boolean): void => {
		expanded = decisionState;
	}

	onMount(() => {
		const subs: (() => void)[] = [];
		subs.push(toggleTrailExpandEventBus.subscribe(emitToggle))
	})
</script>

{#if propagations?.length === 0}
	<ChildlessDecisionComponent
		assignment={decision}
		isLast={composedTrail.isLast}
		fromPreviousTrail={composedTrail.trail.indexOfAssignment(decision) < differOf(composedTrail.id)}
		{emitRevertUpToX}
	/>
{:else}
	<DecisionComponent
		expanded={expanded}
		assignment={decision}
		isLast={composedTrail.isLast}
		emitToggle={emitToggle}
		fromPreviousTrail={composedTrail.trail.indexOfAssignment(decision) < differOf(composedTrail.id)}
		{emitRevertUpToX}
	/>
	{#if expanded}
		{#each propagations as assignment (assignment.toVar())}
			{#if assignment.isK()}
				<BacktrackingComponent
					{assignment}
					isLast={composedTrail.isLast}
					fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
						differOf(composedTrail.id)}
				/>
			{:else if assignment.isBJ()}
				<BackjumpingComponent
					{assignment}
					isLast={composedTrail.isLast}
					fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
						differOf(composedTrail.id)}
					detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
				/>
			{:else}
				<UnitPropagationComponent
					{assignment}
					isLast={composedTrail.isLast}
					fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
						differOf(composedTrail.id)}
					detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
				/>
			{/if}
		{/each}
	{/if}
{/if}
