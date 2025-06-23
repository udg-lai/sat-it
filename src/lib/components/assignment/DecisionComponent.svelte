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
		expanded: boolean;
		emitToggle: () => void;
	}

	let { assignment, isLast, expanded, emitToggle }: Props = $props();

	let openLevel: boolean = $state(false);

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let chrome: boolean = $derived(onChrome());

	$effect(() => {
		openLevel = expanded;
	});

	function emitLevelOpen(): void {
		openLevel = !openLevel;
		emitToggle();
	}
</script>

<HeadTailComponent {inspecting}>
	<decision>
		<button
			class="literal-style decision {chrome ? 'pad-chrome' : 'pad-others'}"
			onclick={emitLevelOpen}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</decision>
</HeadTailComponent>

<style>
	.decision {
		border-left: 1px solid;
		border-right: 1px solid transparent;
	}
</style>
