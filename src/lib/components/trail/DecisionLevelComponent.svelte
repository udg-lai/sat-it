<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import VariableAssignmentComponent from './VariableAssignmentComponent.svelte';

	interface Props {
		decision: VariableAssignment;
		propagations?: VariableAssignment[];
		expanded: boolean;
	}

	let { decision, propagations = [], expanded }: Props = $props();
</script>

<VariableAssignmentComponent
	assignment={decision}
	open={propagations.length === 0 || expanded}
	eventClick={() => (expanded = !expanded)}
/>

{#if propagations && expanded}
	{#each propagations as assignment}
		<VariableAssignmentComponent {assignment} />
	{/each}
{/if}

<style>
	:global(.no-propagations) {
		border-right: 1px solid transparent;
	}
</style>
