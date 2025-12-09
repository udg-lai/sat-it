<script lang="ts">
	import './style.css';
	import ImageDescriptionComponent from './ImageDescriptionComponent.svelte';

	let decision = '/icons/Decision.svg';
	let automaticSteps = '/icons/Automatic Steps.svg';
	let backtracking = '/icons/Backtracking.svg';
	let emptyClause = '/icons/Empty Clause.svg';
	let finishTrail = '/icons/Finish Trail.svg';
	let inspectAllClauses = '/icons/Inspect All Clauses.svg';
	let inspectNextClause = '/icons/Inspect Next Clause.svg';
	let pauseAuto = '/icons/Pause Auto.svg';
	let resolution = '/icons/Resolution.svg';
	let up1 = '/icons/UP1.svg';
	let upn = '/icons/UPn.svg';
	let expand = '/icons/Expand.svg';
	let collapse = '/icons/Collapse.svg';
	let solve = '/icons/Solve.svg';
	let reset = '/icons/Reset.svg';
	let userUndo = '/icons/User Undo.svg';
	let userRedo = '/icons/User Redo.svg';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<division>Algorithmic buttons</division>
	<ImageDescriptionComponent
		icon={emptyClause}
		alt={'Empty clause button'}
		description={'Check if there exists the empty clause in the Formula.'}
	/>
	<ImageDescriptionComponent
		icon={decision}
		alt={'Decision button'}
		description={'Decide a literal.'}
	/>
	<ImageDescriptionComponent
		icon={finishTrail}
		alt={'Finish trail button'}
		description={'Complete a trail until reaching a final state or a conflict.'}
	/>
	<ImageDescriptionComponent
		icon={solve}
		alt="Solve Problem"
		description={'Solve the problem until reaching a final state.'}
	/>
	<ImageDescriptionComponent
		icon={inspectNextClause}
		alt={'Inspect next clause button'}
		description={'Check the following clause of the occurrence list.'}
	/>
	<ImageDescriptionComponent
		icon={inspectAllClauses}
		alt={'Inspect all clause button'}
		description={'Check all the clauses from the occurrence list.'}
	/>
	<ImageDescriptionComponent
		icon={up1}
		alt={'UP one literal'}
		description={'Check clauses in the occurrence list until finding a unit clause or a conflict.'}
	/>
	<ImageDescriptionComponent
		icon={upn}
		alt={'UP all literal'}
		description={'Check all the clauses from the occurrence list doing all possible unit propagations.'}
	/>
	<ImageDescriptionComponent
		icon={resolution}
		alt={'Resolution button'}
		description={'Do one resolution step.'}
	/>
	<ImageDescriptionComponent
		icon={backtracking}
		alt={'Conflict button'}
		description={'Automatically finish conflict analysis'}
	/>
	<ImageDescriptionComponent
		icon={automaticSteps}
		alt={'Begin automatic solving'}
		description={'Begin automatic solving mode'}
	/>
	<ImageDescriptionComponent
		icon={pauseAuto}
		alt={'Stop automatic solving'}
		description={'Stop automatic solving mode'}
	/>

	<division class="pt-1">Non-algorithmic buttons</division>
	<ImageDescriptionComponent
		icon={reset}
		alt={'Reset problem'}
		description={'Reset the solving process of the current problem.'}
	/>
	<ImageDescriptionComponent
		icon={userUndo}
		alt={'Undo user action'}
		description={'Undo until the latest press button.'}
	/>
	<ImageDescriptionComponent
		icon={userRedo}
		alt={'Redo user action'}
		description={'Redo the undone state.'}
	/>
	<ImageDescriptionComponent
		icon={expand}
		alt={'Stop automatic solving'}
		description={'Expand the decision levels of all trails.'}
	/>
	<ImageDescriptionComponent
		icon={collapse}
		alt={'Stop automatic solving'}
		description={'Collapse the decision levels of all trails.'}
	/>
</div>

<style>
	division {
		text-align: center;
		font-size: 12px;
		border-bottom: 1px solid var(--border-color);
	}
</style>
