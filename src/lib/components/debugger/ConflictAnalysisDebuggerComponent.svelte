<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { CodeMergeOutline, ForwardOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import './style.css';

	const assignmentProps = {
		size: 'md'
	};
</script>

<conflict-analysis-debugger>
	<button
		class="btn general-btn conflict-btn"
		title="Step"
		onclick={() => {
			stateMachineEventBus.emit('step');
		}}
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>

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
