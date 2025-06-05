<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { onMount } from 'svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';

	interface Props {
		assignment: VariableAssignment;
		isLast: boolean;
		expanded: boolean;
	}

	let { assignment, isLast, expanded }: Props = $props();

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	const inspectedVariable: number = $derived(getInspectedVariable());
</script>

<decision>
	<button
		class="literal-style decision {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:level-expanded={expanded}
		class:inspecting={assignment.variableId() === inspectedVariable && isLast}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</decision>

<style>
	.decision {
		border-color: black;
		color: black;
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.inspecting {
		color: var(--inspecting-color);
		border-color: var(--inspecting-color);
	}

	.level-expanded {
		border-right: 1px solid transparent;
	}
</style>
