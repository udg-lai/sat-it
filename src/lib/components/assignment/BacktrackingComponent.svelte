<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';

	interface Props {
		assignment: VariableAssignment;
		eventClick?: () => void;
	}

	let { assignment, eventClick }: Props = $props();

	function onClick() {
		eventClick?.();
	}

</script>

<button class="literal-style backtracking" onclick={onClick}>
	<MathTexComponent equation={assignment.toTeX()} />
</button>

<style>
	.backtracking {
		border-color: #f77777;
		color: #f77777;
		border-left: 1px transparent;
		border-right: 1px transparent;
		cursor: help;
	}

	:global(mo) {
		margin-bottom: 2px;
	}
</style>
