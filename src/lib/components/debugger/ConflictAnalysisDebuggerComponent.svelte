<script lang="ts">
	import './_style.css';
	import { ForwardOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/transversal/events.ts';

	const assignmentProps = {
		size: 'md'
	};
</script>

<conflict-analysis-debugger>
	<button
		class="btn general-btn ca-btn"
		title="Step"
		onclick={() => {
			stateMachineEventBus.emit('step');
		}}
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>

	<button
		class="btn general-btn ca-btn"
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
	.ca-btn {
		color: var(--backtracking-color);
		border-color: var(--backtracking-color);
		transition: border-color 0.3s ease;
		border-style: dashed;
	}
</style>
