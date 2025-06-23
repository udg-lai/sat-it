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
