<script lang="ts">
	import { CaretRightOutline, CodeMergeOutline, RefreshOutline } from 'flowbite-svelte-icons';
	import { emitAssignmentEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { finsihed } from '$lib/store/problem.store.ts';
	import { get } from 'svelte/store';
	import {
		isUnresolved,
		isUnsat,
		type Eval
	} from '$lib/transversal/utils/interfaces/IClausePool.ts';

	interface Props {
		previousEval: Eval;
	}

	let { previousEval }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8 cursor-pointer'
	};
	$effect(() => {
		console.log(get(finsihed));
	});
</script>

{#if isUnresolved(previousEval)}
	<button
		class="btn general-btn"
		onclick={() => emitAssignmentEvent({ type: 'automated' })}
		title="Decide"
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>
{:else if isUnsat(previousEval)}
	<button
		class="btn general-btn"
		onclick={() => emitAssignmentEvent({ type: 'automated' })}
		title="Backtrack"
	>
		<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
	</button>
{:else}
	<button class="btn general-btn" title="Reset">
		<DynamicRender component={RefreshOutline} props={assignmentProps} />
	</button>
{/if}
