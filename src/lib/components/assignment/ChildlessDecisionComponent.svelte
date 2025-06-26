<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		fromPreviousTrail?: boolean;
		emitUndo?: (assignment: VariableAssignment) => void;
	}

	let { assignment, isLast = false, fromPreviousTrail = false, emitUndo }: Props = $props();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let chrome: boolean = $derived(onChrome());

	const emitAlgorithmicUndo =  (): void => {
		emitUndo?.(assignment);
	}
</script>

<HeadTailComponent {inspecting}>
	<childless-decision class:previous-assignment={fromPreviousTrail}>
		<button
			class="literal-style decision level-expanded childless {chrome ? 'pad-chrome' : 'pad-others'}"
			onclick={emitAlgorithmicUndo}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</childless-decision>
</HeadTailComponent>

<style>
	.decision {
		border-color: var(--decision-color);
		color: var(--decision-color);
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.level-expanded {
		border-right: 1px solid transparent;
	}

	.childless {
		cursor: unset;
	}
</style>
