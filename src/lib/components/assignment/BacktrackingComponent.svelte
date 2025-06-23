<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import { onChrome } from '$lib/app.svelte.ts';

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

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent {inspecting}>
	<backtracking>
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
