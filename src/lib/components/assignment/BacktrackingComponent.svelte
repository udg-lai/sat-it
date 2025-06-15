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
		eventClick?: () => void;
	}

	let { assignment, isLast, eventClick }: Props = $props();

	function onClick() {
		eventClick?.();
	}

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	const inspectedVariable: number = $derived(getInspectedVariable());
</script>

<backtracking>
	<button
		class="literal-style backtracking {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:inspecting={assignment.variableId() === inspectedVariable && isLast}
		onclick={onClick}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</backtracking>

<style>
	.backtracking {
		border-color: var(--conflict-color);
		color: var(--conflict-color);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
		border-style: dashed;
		cursor: unset;
	}

	.inspecting {
		color: var(--inspecting-color);
		border-color: var(--inspecting-color);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
	}

	:global(mo) {
		margin-bottom: 3px;
	}
</style>
