<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import './_style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast: boolean;
	}

	let { assignment, isLast }: Props = $props();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent {inspecting}>
	<childless-decision>
		<button
			class="literal-style decision level-expanded childless {chrome ? 'pad-chrome' : 'pad-others'}"
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
