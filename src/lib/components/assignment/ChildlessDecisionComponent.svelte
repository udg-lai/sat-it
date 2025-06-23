<script lang="ts">
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { onMount } from 'svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
	}

	let { assignment, isLast = false}: Props = $props();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});
</script>

<HeadTailComponent {inspecting}>
	<childless-decision>
		<button
			class="literal-style decision level-expanded childless {onChrome
				? 'pad-chrome'
				: 'pad-others'}"
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
