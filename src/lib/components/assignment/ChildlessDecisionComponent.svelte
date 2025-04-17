<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';

	interface Props {
		assignment: VariableAssignment;
	}

	let { assignment }: Props = $props();
</script>

<button class="literal-style decision level-expanded childless">
	<MathTexComponent equation={assignment.toTeX()} />
</button>

<style>
	.decision {
		border-color: black;
		color: black;
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
