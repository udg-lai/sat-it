<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';

	interface Props {
		assignment: VariableAssignment;
	}

	let { assignment }: Props = $props();
</script>

<button class="literal-style decision unit-propagation">
	<MathTexComponent equation={assignment.toTeX()} />
</button>
