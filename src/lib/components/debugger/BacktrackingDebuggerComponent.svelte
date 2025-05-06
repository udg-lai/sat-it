<script lang="ts">
	import './_style.css';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import { emitAssignmentEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { userActionEventBus } from '$lib/transversal/events.ts';
	import { isUnSAT, type Eval } from '$lib/transversal/interfaces/IClausePool.ts';

	interface Props {
		previousEval: Eval;
		disableButton: boolean;
	}

	let { previousEval, disableButton }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

{#if !isUnSAT(previousEval)}
	<button
		class="btn general-btn"
		class:invalidOption={disableButton}
		onclick={() => {
			emitAssignmentEvent({ type: 'automated' });
			userActionEventBus.emit('record');
		}}
		title="Decide"
		disabled={disableButton}
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>
{:else}
	<button
		class="btn general-btn bkt-btn"
		class:invalidOption={disableButton}
		onclick={() => {
			emitAssignmentEvent({ type: 'automated' });
			userActionEventBus.emit('record');
		}}
		title="Backtrack"
		disabled={disableButton}
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>
{/if}
