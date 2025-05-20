<script lang="ts">
	import './_style.css';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, userActionEventBus } from '$lib/transversal/events.ts';
	import { updateAssignment } from '$lib/store/assignment.svelte.ts';

	interface Props {
		backtrackingState: boolean;
		finished: boolean;
		cdMode: boolean;
	}

	let { backtrackingState, finished, cdMode: upMode }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

{#if !backtrackingState}
	<button
		class="btn general-btn"
		class:invalidOption={finished || upMode}
		onclick={() => {
			updateAssignment('automated');
			stateMachineEventBus.emit('step');
			userActionEventBus.emit('record');
		}}
		title="Decide"
		disabled={finished || upMode}
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>
{:else}
	<button
		class="btn general-btn bkt-btn"
		class:invalidOption={finished || upMode}
		onclick={() => {
			stateMachineEventBus.emit('step');
		}}
		title="Backtrack"
		disabled={finished || upMode}
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>
{/if}
