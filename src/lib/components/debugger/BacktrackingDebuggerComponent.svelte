<script lang="ts">
	import { CaretRightOutline, CodeMergeOutline, RefreshOutline } from 'flowbite-svelte-icons';
	import { emitAssignmentEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { finsihed, resetProblem } from '$lib/store/problem.store.ts';
	import { get } from 'svelte/store';

	interface Props {
		defaultNextVariable: number | undefined;
	}

	let { defaultNextVariable }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8 cursor-pointer'
	};
	$effect(() => {
		console.log(get(finsihed));
	});
</script>

{#if !$finsihed}
	{#if defaultNextVariable}
		<button
			class="btn general-btn"
			onclick={() => emitAssignmentEvent({ type: 'automated' })}
			title="Decide"
		>
			<DynamicRender component={CaretRightOutline} props={assignmentProps} />
		</button>
	{:else}
		<button
			class="btn general-btn"
			onclick={() => emitAssignmentEvent({ type: 'automated' })}
			title="Backtrack"
		>
			<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
		</button>
	{/if}
{:else}
	<button class="btn general-btn" onclick={resetProblem} title="Restet">
		<DynamicRender component={RefreshOutline} props={assignmentProps} />
	</button>
{/if}
