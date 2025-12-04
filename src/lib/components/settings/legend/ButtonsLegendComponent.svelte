<script lang="ts">
	import './style.css';
	import DescriptionComponent from './DescriptionComponent.svelte';
	import { RefreshOutline, ReplyOutline } from 'flowbite-svelte-icons';
	import solve from '$lib/icons/Solve.svg';
	import decision from '$lib/icons/Decision.svg';
	import automaticSteps from '$lib/icons/Automatic Steps.svg';
	import backtracking from '$lib/icons/Backtracking.svg';
	import emptyClause from '$lib/icons/Empty Clause.svg';
	import finishTrail from '$lib/icons/Finish Trail.svg';
	import inspectAllClauses from '$lib/icons/Inspect All Clauses.svg';
	import inspectNextClause from '$lib/icons/Inspect Next Clause.svg';
	import pauseAuto from '$lib/icons/Pause Auto.svg';
	import resolution from '$lib/icons/Resolution.svg';
	import up1 from '$lib/icons/UP1.svg';
	import upn from '$lib/icons/UPn.svg';
	import expand from '$lib/icons/Expand.svg';
	import collapse from '$lib/icons/Collapse.svg';

	import ImageDescriptionComponent from './ImageDescriptionComponent.svelte';

	const reverseProps = {
		class: 'transform -scale-x-100',
		size: 'lg'
	};
	const regularProps = {
		size: 'lg'
	};
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
	<DescriptionComponent
		component={RefreshOutline}
		componentProps={regularProps}
		description={'Reset the solving process of the current problem.'}
	/>
	<DescriptionComponent
		component={ReplyOutline}
		componentProps={regularProps}
		description={'Undo until the latest press button.'}
	/>
	<DescriptionComponent
		component={ReplyOutline}
		componentProps={reverseProps}
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
