<script lang="ts">
	import {
		ArrowRightOutline,
		CaretRightOutline,
		ForwardOutline,
		StopOutline
	} from 'flowbite-svelte-icons';
	import DescriptionComponent from './DescriptionComponent.svelte';
	import SolveIcon from '$lib/components/debugger/buttons/SolveIcon.svelte';
	import StepComponent from '$lib/components/debugger/buttons/StepComponent.svelte';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent icon={CaretRightOutline} description={'Single step button'} />
	<DescriptionComponent
		icon={ArrowRightOutline}
		description={'Complete a trail until reaching a final state or a conflict.'}
	/>
	<DescriptionComponent
		icon={SolveIcon}
		description={'Solve the problem until reaching a final state.'}
	/>
	<DescriptionComponent
		icon={ForwardOutline}
		description={'When an occurrence list is being examined, automatically check its clauses left'}
	/>
	<DescriptionComponent
		icon={SolveIcon}
		description={'When an occurrence list is being examined, automatically check all the occurrence lists left to be checked.'}
	/>
	<DescriptionComponent
		icon={SolveIcon}
		description={'When a conflict has been detected in a non-conflict analysis algorithm, it does a backtracking.'}
	/>
	<DescriptionComponent
		icon={StepComponent}
		description={'When in conflict analysis, automatically finishes it.'}
	/>
	<DescriptionComponent
		icon={StopOutline}
		description={'When in automatic solving, stop the process.'}
	/>
	<DescriptionComponent
		icon={SolveIcon}
		description={'Reset the solving process of the current problem.'}
	/>
	<DescriptionComponent icon={SolveIcon} description={'Undo until the latest press button.'} />
	<DescriptionComponent icon={SolveIcon} description={'Redo the undone state.'} />
	<DescriptionComponent
		icon={SolveIcon}
		description={'Expand the decision levels of all trails.'}
	/>
	<DescriptionComponent
		icon={SolveIcon}
		description={'Collapse the decision levels of all trails.'}
	/>
</div>
