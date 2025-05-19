<script>
	// @ts-nocheck
	import {  ForwardOutline, ChevronDoubleRightOutline, CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { stateMachineEventBus } from '$lib/transversal/events.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	onclick={() => {
		stateMachineEventBus.emit('step');
	}}
	title="Step"
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

<button
	class="btn general-btn"
	title="Following Variable"
	onclick={() => {
		stateMachineEventBus.emit('followingVariable');
	}}
>
	<DynamicRender component={ForwardOutline} props={assignmentProps} />
</button>

<button
	class="btn general-btn"
	title="Finish unit propagations"
	onclick={() => {
		stateMachineEventBus.emit('finishUP');
	}}
>
	<DynamicRender component={ChevronDoubleRightOutline} props={assignmentProps} />
</button>
