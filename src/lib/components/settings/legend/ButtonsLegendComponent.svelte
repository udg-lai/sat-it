<script lang="ts">
	import DescriptionComponent from './DescriptionComponent.svelte';
	import StepComponent from '$lib/components/debugger/buttons/StepComponent.svelte';
	import SolveProblemComponent from '$lib/components/debugger/buttons/SolveProblemComponent.svelte';
	import NextVariableComponent from '$lib/components/debugger/buttons/NextVariableComponent.svelte';
	import FinishConflictDetectionComponent from '$lib/components/debugger/buttons/FinishConflictDetectionComponent.svelte';
	import BacktrackingComponent from '$lib/components/debugger/buttons/BacktrackingComponent.svelte';
	import ConflictAnalysisComponent from '$lib/components/debugger/buttons/ConflictAnalysisComponent.svelte';
	import StopAutoSolvingComponent from '$lib/components/debugger/buttons/StopAutoSolvingComponent.svelte';
	import ResetProblemComponent from '$lib/components/debugger/buttons/ResetProblemComponent.svelte';
	import UndoComponent from '$lib/components/debugger/buttons/UndoComponent.svelte';
	import RedoComponent from '$lib/components/debugger/buttons/RedoComponent.svelte';
	import ExpColTrailComponent from '$lib/components/debugger/buttons/ExpColTrailComponent.svelte';
	import SolveTrailComponent from '$lib/components/debugger/buttons/SolveTrailComponent.svelte';
	import './style.css';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent component={StepComponent} description={'Single step button'} />
	<DescriptionComponent
		component={SolveTrailComponent}
		description={'Complete a trail until reaching a final state or a conflict.'}
	/>
	<DescriptionComponent
		component={SolveProblemComponent}
		description={'Solve the problem until reaching a final state.'}
	/>
	<DescriptionComponent
		component={NextVariableComponent}
		description={'When an occurrence list is being examined, automatically check its clauses left'}
	/>
	<DescriptionComponent
		component={FinishConflictDetectionComponent}
		description={'When an occurrence list is being examined, automatically check all the occurrence lists left to be checked.'}
	/>
	<DescriptionComponent
		component={BacktrackingComponent}
		description={'When a conflict has been detected in a non-conflict analysis algorithm, it does a backtracking.'}
	/>
	<DescriptionComponent
		component={ConflictAnalysisComponent}
		description={'When in conflict analysis, automatically finishes it.'}
	/>
	<DescriptionComponent
		component={StopAutoSolvingComponent}
		description={'When in automatic solving, stop the process.'}
	/>
	<DescriptionComponent
		component={ResetProblemComponent}
		description={'Reset the solving process of the current problem.'}
	/>
	<DescriptionComponent component={UndoComponent} description={'Undo until the latest press button.'} />
	<DescriptionComponent component={RedoComponent} description={'Redo the undone state.'} />
	<DescriptionComponent
		component={ExpColTrailComponent}
		description={'Expand or collapse the decision levels of all trails.'}
	/>

</div>
