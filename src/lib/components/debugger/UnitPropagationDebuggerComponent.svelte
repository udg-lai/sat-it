<script>
	// @ts-nocheck
	import { ArrowRightOutline, ReplyOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import StateMachineStepDebugger from './StateMachineStep.svelte';
	import { stateMachineEventBus } from '$lib/transversal/events.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
	const reverseProps = {
		class: 'h-8 w-8 transform -scale-x-100'
	};
</script>

<StateMachineStepDebugger />

<button
	class="btn general-btn"
	title="Following Variable"
	onclick={() => {
		stateMachineEventBus.emit('followingVariable');
	}}
>
	<DynamicRender component={ReplyOutline} props={reverseProps} />
</button>

<button
	class="btn general-btn"
	title="Finish unit propagations"
	onclick={() => {
		stateMachineEventBus.emit('finishUP');
	}}
>
	<DynamicRender component={ArrowRightOutline} props={assignmentProps} />
</button>
