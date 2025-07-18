<script lang="ts">
	import DescriptionComponent from './DescriptionComponent.svelte';
	import StepButton from '$lib/assets/buttons/StepButton.png';
	import FinishTrailButton from '$lib/assets/buttons/FinishTrailButton.png';
	import SolveProblemButton from '$lib/assets/buttons/SolveProblemButton.png';
	import NextVariableButton from '$lib/assets/buttons/FollowingVariableButton.png';
	import FinishCDButton from '$lib/assets/buttons/FinishCDButton.png';
	import BacktrackingButton from '$lib/assets/buttons/BacktrackingButton.png';
	import FinishCAButton from '$lib/assets/buttons/FinishCAButton.png';
	import StopButton from '$lib/assets/buttons/StopButton.png';
	import ResetButton from '$lib/assets/buttons/ResetButton.png';
	import UndoButton from '$lib/assets/buttons/UndoButton.png';
	import RedoButton from '$lib/assets/buttons/RedoButton.png';
	import ExpandDLButton from '$lib/assets/buttons/ExpandDLButton.png';
	import CollapseDLButton from '$lib/assets/buttons/CollapseDLButton.png';
	import './style.css';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent
		image={StepButton}
		imageAlt="Step button"
		description={'Single step button'}
	/>
	<DescriptionComponent
		image={FinishTrailButton}
		imageAlt="Finish trail button"
		description={'Complete a trail until reaching a final state or a conflict.'}
	/>
	<DescriptionComponent
		image={SolveProblemButton}
		imageAlt="Finish problem button"
		description={'Solve the problem until reaching a final state.'}
	/>
	<DescriptionComponent
		image={NextVariableButton}
		imageAlt="Next variable button"
		description={'When an occurrence list is being examined, automatically check its clauses left'}
	/>
	<DescriptionComponent
		image={FinishCDButton}
		imageAlt="Finish conflict detection button"
		description={'When an occurrence list is being examined, automatically check all the occurrence lists left to be checked.'}
	/>
	<DescriptionComponent
		image={BacktrackingButton}
		imageAlt="Backtracking button"
		description={'When a conflict has been detected in a non-conflict analysis algorithm, it does a backtracking.'}
	/>
	<DescriptionComponent
		image={FinishCAButton}
		imageAlt="Finish conflict analysis button"
		description={'When in conflict analysis, automatically finishes it.'}
	/>
	<DescriptionComponent
		image={StopButton}
		imageAlt="Stop automatic solving button"
		description={'When in automatic solving, stop the process.'}
	/>
	<DescriptionComponent
		image={ResetButton}
		imageAlt="Reset problem button"
		description={'Reset the solving process of the current problem.'}
	/>
	<DescriptionComponent
		image={UndoButton}
		imageAlt="Undo button"
		description={'Undo until the latest press button.'}
	/>
	<DescriptionComponent
		image={RedoButton}
		imageAlt="Redo button"
		description={'Redo the undone state.'}
	/>
	<DescriptionComponent
		image={ExpandDLButton}
		imageAlt="Expand decision level button"
		description={'Expand the decision levels of all trails.'}
	/>
	<DescriptionComponent
		image={CollapseDLButton}
		imageAlt="Collapse decision level button"
		description={'Collapse the decision levels of all trails.'}
	/>
</div>
