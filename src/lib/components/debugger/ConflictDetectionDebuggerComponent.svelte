<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import {
		ChevronDoubleRightOutline,
		ForwardOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import StepComponent from './StepDebuggerComponent.svelte';

	const assignmentProps = {
		size: 'md'
	};
</script>

<conflict-detection-debugger>
	<StepComponent />

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
		title="Finish CD"
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
