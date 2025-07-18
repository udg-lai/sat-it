<script lang="ts">
	import Variable from '$lib/entities/Variable.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import DescriptionComponent from './DescriptionComponent.svelte';

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
<div class="body-class"></div>
