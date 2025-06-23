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
		isLast: boolean;
		eventClick?: () => void;
	}

	let { assignment, isLast, eventClick }: Props = $props();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	function onClick() {
		eventClick?.();
	}

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});
</script>

<HeadTailComponent {inspecting}>
	<backtracking>
		<button
			class="literal-style backtracking {onChrome ? 'pad-chrome' : 'pad-others'}"
			onclick={onClick}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</backtracking>
</HeadTailComponent>

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

	:global(mo) {
		margin-bottom: 3px;
	}
</style>
