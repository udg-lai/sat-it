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
		emitToggle: () => void
	}

	let { assignment, isLast, expanded, emitToggle }: Props = $props();

	let openLevel: boolean = $state(false);

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	$effect(() => {
		openLevel = expanded;
	})

	const inspectedVariable: number = $derived(getInspectedVariable());

	function emitLevelOpen(): void {
		openLevel = !openLevel;
		emitToggle();
	}
</script>

<decision>
	<button
		class="literal-style decision {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:level-closed={!expanded || !openLevel}
		class:inspecting={assignment.variableId() === inspectedVariable && isLast}
		onclick={emitLevelOpen}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</decision>

<style>
	.decision {
		border-color: black;
		color: black;
		border-left: 1px solid;
		border-right: 1px solid transparent;
	}

	.inspecting {
		color: var(--inspecting-color);
		border-color: var(--inspecting-color);
		border-right: 1px solid transparent;
	}

	.level-closed {
		border-right: 1px solid black;
	}
</style>
