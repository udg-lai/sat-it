<script lang="ts">
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { onChrome } from '$lib/app.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		fromPreviousTrail?: boolean;
		eventClick?: () => void;
	}

	let { assignment, isLast = false, fromPreviousTrail = false, eventClick }: Props = $props();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	function onClick() {
		eventClick?.();
	}

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent {inspecting}>
	<backtracking class:previous-assignment={fromPreviousTrail}>
		<button
			class="literal-style backtracking {chrome ? 'pad-chrome' : 'pad-others'}"
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

	:global(mover mo) {
		margin-bottom: 3px;
	}
</style>
