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
		emitToggle: () => void;
	}

	let { assignment, isLast, expanded, emitToggle }: Props = $props();

	let openLevel: boolean = $state(false);
	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let color: string = $derived(inspecting ? 'var(--inspecting-color)' : 'black');
	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	$effect(() => {
		openLevel = expanded;
	});

	function emitLevelOpen(): void {
		openLevel = !openLevel;
		emitToggle();
	}
</script>

<decision>
	<button
		class="literal-style decision {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:level-closed={!expanded || !openLevel}
		style="--color: {color};"
		class:inspecting
		onclick={emitLevelOpen}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</decision>

<style>
	.decision {
		border-color: var(--color);
		color: var(--color);
		border-left: 1px solid;
		border-right: 1px solid transparent;
	}

	.level-closed {
		border-right: 1px solid var(--color);
	}
</style>
