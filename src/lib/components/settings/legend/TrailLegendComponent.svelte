<script lang="ts">
	import BacktrackingComponent from '$lib/components/assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '$lib/components/assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '$lib/components/assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '$lib/components/assignment/UnitPropagationComponent.svelte';
	import Variable from '$lib/entities/Variable.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';

	const exampleVariable = new Variable(1, true);
	const decisionExample = VariableAssignment.newManualAssignment(exampleVariable);
	const backtrackingExample = VariableAssignment.newBacktrackingAssignment(exampleVariable);
	const unitPropagationExample = VariableAssignment.newUnitPropagationAssignment(
		exampleVariable,
		1
	);
</script>

<div class="heading-class">
	<span class="pt-1">Trail</span>
</div>
<div class="body-class">
	<ChildlessDecisionComponent assignment={decisionExample} />
	<DecisionComponent assignment={decisionExample} expanded={false} />
	<BacktrackingComponent assignment={backtrackingExample} />
	<UnitPropagationComponent assignment={unitPropagationExample} />
</div>
