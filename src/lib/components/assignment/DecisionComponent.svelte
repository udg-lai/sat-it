<script lang="ts">
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
	import { runningOnChrome } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

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
