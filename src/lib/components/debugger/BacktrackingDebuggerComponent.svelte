<script lang="ts">
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import { emitActionEvent, emitAssignmentEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';

	interface Props {
		defaultNextVariable: number | undefined;
	}

	let { defaultNextVariable }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

{#if defaultNextVariable}
	<button
		class="btn general-btn"
		onclick={() => {
			emitAssignmentEvent({ type: 'automated' });
			emitActionEvent({ type: 'record' });
		}}
		title="Decide"
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>
{:else}
	<button
		class="btn general-btn bkt-btn"
		onclick={() => {
			emitAssignmentEvent({ type: 'automated' });
			emitActionEvent({ type: 'record' });
		}}
		title="Backtrack"
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>
{/if}
