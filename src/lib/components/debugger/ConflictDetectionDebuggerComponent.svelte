<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import {
		CaretRightOutline,
		ChevronDoubleRightOutline,
		ForwardOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';

	const assignmentProps = {
		size: 'md'
	};
</script>

<conflict-detection-debugger>
	<button
		class="btn general-btn"
		title="Step"
		onclick={() => {
			toggleTrailExpandEventBus.emit(true);
			stateMachineEventBus.emit('step');
		}}
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>

	<button
		class="btn general-btn"
		title="Next variable"
		onclick={() => {
			toggleTrailExpandEventBus.emit(true);
			stateMachineEventBus.emit('nextVariable');
		}}
	>
		<DynamicRender component={ForwardOutline} props={assignmentProps} />
	</button>

	<button
		class="btn general-btn"
		title="Finish UPs"
		onclick={() => {
			toggleTrailExpandEventBus.emit(true);
			stateMachineEventBus.emit('finishCD');
		}}
	>
		<DynamicRender component={ChevronDoubleRightOutline} props={assignmentProps} />
	</button>
</conflict-detection-debugger>

<style>
	conflict-detection-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
