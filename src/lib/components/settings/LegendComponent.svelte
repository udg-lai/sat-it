<script lang="ts">
	import Variable from '$lib/entities/Variable.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	const exampleVariable = new Variable(1, true);
	const decisionExample = VariableAssignment.newManualAssignment(exampleVariable);
	const backtrackingExample = VariableAssignment.newBacktrackingAssignment(exampleVariable);
	const unitPropagationExample = VariableAssignment.newUnitPropagationAssignment(
		exampleVariable,
		1
	);
</script>

<div class="legend pointer-events-none flex flex-col items-center text-center">
	<div class="flex w-full max-w-4xl flex-row items-start justify-center">
		<div class="flex flex-1 flex-col items-center">
			<p class="mb-2"><strong>Decision expanded</strong></p>
			<ChildlessDecisionComponent assignment={decisionExample} />
		</div>
		<div class="flex flex-1 flex-col items-center">
			<p class="mb-2"><strong>Decision colapsed</strong></p>
			<DecisionComponent assignment={decisionExample} expanded={false} />
		</div>
	</div>

	<div class="flex w-full max-w-4xl flex-row items-start justify-center">
		<div class="flex flex-1 flex-col items-center">
			<p class="mb-2"><strong>Backtracking</strong></p>
			<BacktrackingComponent assignment={backtrackingExample} />
		</div>
		<div class="flex flex-1 flex-col items-center">
			<p class="mb-2"><strong>Unit Propagations</strong></p>
			<UnitPropagationComponent assignment={unitPropagationExample} />
		</div>
	</div>
</div>

<style>
	.legend {
		display: flex;
		flex: 1;
		gap: max(2rem, 10vh);
	}
</style>
