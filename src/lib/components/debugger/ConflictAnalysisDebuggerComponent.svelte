<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ForwardOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import './style.css';
	import StepComponent from './StepDebuggerComponent.svelte';

	const assignmentProps = {
		size: 'md'
	};
</script>

<conflict-analysis-debugger>
	<StepComponent myClass={'conflict-btn'}/>

	<button
		class="btn general-btn conflict-btn"
		title="Finish Conflict Analysis"
		onclick={() => {
			toggleTrailExpandEventBus.emit(true);
			stateMachineEventBus.emit('finishCA');
		}}
	>
		<DynamicRender component={ForwardOutline} props={assignmentProps} />
	</button>
</conflict-analysis-debugger>

<style>
	conflict-analysis-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
