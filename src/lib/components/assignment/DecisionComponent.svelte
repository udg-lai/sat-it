<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { onMount } from 'svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';
	import HeadTailComponent from '../HeadTailComponent.svelte';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		expanded?: boolean;
		emitToggle?: () => void;
	}

	let { assignment, isLast = false, expanded = false, emitToggle }: Props = $props();

	let openLevel: boolean = $state(false);

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	$effect(() => {
		openLevel = expanded;
	});

	function emitLevelOpen(): void {
		openLevel = !openLevel;
		emitToggle?.();
	}
</script>

<HeadTailComponent {inspecting}>
	<decision>
		<button
			class="literal-style decision {onChrome ? 'pad-chrome' : 'pad-others'}"
			class:open={openLevel}
			onclick={emitLevelOpen}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</decision>
</HeadTailComponent>

<style>
	.decision {
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.open {
		border-right: 1px solid transparent;
	}
</style>
