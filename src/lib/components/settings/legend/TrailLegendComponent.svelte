<script lang="ts">
	import DescriptionComponent from './DescriptionComponent.svelte';
	import Variable from '$lib/entities/Variable.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import ChildlessDecisionComponent from '$lib/components/assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '$lib/components/assignment/DecisionComponent.svelte';
	import BacktrackingComponent from '$lib/components/assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '$lib/components/assignment/UnitPropagationComponent.svelte';
	import {
		CheckOutline,
		CloseOutline,
		CogOutline,
		CompressOutline,
		HammerOutline
	} from 'flowbite-svelte-icons';
	const exampleVariable = new Variable(1, true);
	const decisionExample = VariableAssignment.newManualAssignment(exampleVariable);
	const regularProps = {
		size: 'lg'
	};
	const satProps = {
		color: 'var(--satisfied-color)',
		size: 'lg'
	};
	const unsatProps = {
		color: 'var(--unsatisfied-color)',
		size: 'lg'
	};
	const conflictProps = {
		color: 'var(--conflict-color)',
		size: 'lg'
	};
	const trailProps = {
		assignment: decisionExample
	};
</script>

<div class="heading-class">
	<span class="pt-1">Trail</span>
</div>
<div class="body-class">
	<DescriptionComponent
		component={ChildlessDecisionComponent}
		componentProps={trailProps}
		description={'Decision with no propagations or with expanded propagations. If pressed, collapse decision level and revert up to here options can be displayed'}
	/>
	<DescriptionComponent
		component={DecisionComponent}
		componentProps={trailProps}
		description={'Decision with collapsed propagations. If pressed, expand decision level and revert up to here options can be displayed'}
	/>
	<DescriptionComponent
		component={UnitPropagationComponent}
		componentProps={trailProps}
		description={'Unit propagation. If pressed, it shows the id and literals from the clause that caused the propagation'}
	/>
	<DescriptionComponent
		component={BacktrackingComponent}
		componentProps={trailProps}
		description={'Conflict representation. If pressed, and is a backjumping, it shows the id and literals from the clauses that caused the propagation'}
	/>
	<DescriptionComponent
		component={CogOutline}
		componentProps={regularProps}
		description={"Icon that represents that the trail doesn't have an outcome. If pressed, the trail information view is displayed"}
	/>
	<DescriptionComponent
		component={HammerOutline}
		componentProps={conflictProps}
		description={'Icon that represents that the trail has a conflict. If pressed, the trail information view is displayed'}
	/>
	<DescriptionComponent
		component={CompressOutline}
		componentProps={regularProps}
		description={'Icon that represents that the trail information view is opened. If pressed, this view is closed.'}
	/>
	<DescriptionComponent
		component={CheckOutline}
		componentProps={satProps}
		description={'Icon that represents that the trail has reached a SAT state'}
	/>
	<DescriptionComponent
		component={CloseOutline}
		componentProps={unsatProps}
		description={'Icon that represents that the trail has reached an UnSAT state'}
	/>
</div>
