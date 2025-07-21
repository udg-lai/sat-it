<script lang="ts">
	import './style.css';
	import DescriptionComponent from './DescriptionComponent.svelte';
	import {
		ArrowRightOutline,
		CaretRightOutline,
		ChevronDoubleRightOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		CodeMergeOutline,
		ForwardOutline,
		RefreshOutline,
		ReplyOutline,
		StopOutline
	} from 'flowbite-svelte-icons';
	import SolveIcon from '$lib/components/debugger/buttons/SolveIcon.svelte';

	const reverseProps = {
		class: 'transform -scale-x-100',
		size: 'lg'
	};
	const regularProps = {
		size: 'lg'
	};
	const conflictProps = {
		color: 'var(--conflict-color)',
		size: 'lg'
	};
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent
		component={CaretRightOutline}
		componentProps={regularProps}
		description={'Single step button'}
	/>
	<DescriptionComponent
		component={ArrowRightOutline}
		componentProps={regularProps}
		description={'Complete a trail until reaching a final state or a conflict.'}
	/>
	<DescriptionComponent
		component={SolveIcon}
		componentProps={regularProps}
		description={'Solve the problem until reaching a final state.'}
	/>
	<DescriptionComponent
		component={ForwardOutline}
		componentProps={regularProps}
		description={'When an occurrence list is being examined, automatically check its clauses left'}
	/>
	<DescriptionComponent
		component={ChevronDoubleRightOutline}
		componentProps={regularProps}
		description={'When an occurrence list is being examined, automatically check all the occurrence lists left to be checked.'}
	/>
	<DescriptionComponent
		component={CodeMergeOutline}
		componentProps={conflictProps}
		description={'When a conflict has been detected in a non-conflict analysis algorithm, it does a backtracking.'}
	/>
	<DescriptionComponent
		component={ForwardOutline}
		componentProps={conflictProps}
		description={'When in conflict analysis, automatically finishes it.'}
	/>
	<DescriptionComponent
		component={StopOutline}
		componentProps={regularProps}
		description={'When in automatic solving, stop the process.'}
	/>
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
	<DescriptionComponent
		component={ChevronRightOutline}
		componentProps={regularProps}
		description={'Expand the decision levels of all trails.'}
	/>
	<DescriptionComponent
		component={ChevronLeftOutline}
		componentProps={regularProps}
		description={'Collapse the decision levels of all trails.'}
	/>
</div>
