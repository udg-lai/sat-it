<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		assignment?: VariableAssignment;
		propagated?: VariableAssignment[];
		onClick?: () => void;
	}

	let { assignment, propagated, onClick }: Props = $props();

	let levelExpanded = $state(false);
</script>

{#if assignment}
	<button
		class="literal-style decision"
		class:level-expanded={levelExpanded}
		onclick={() => (levelExpanded = !levelExpanded)}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
{/if}

{#if propagated}
	{#each propagated as assignment}
		<button
			class="literal-style decision"
			class:backtracking={assignment.isK()}
			class:unit-propagation={assignment.isUP()}
			onclick={onClick}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	{/each}
{/if}

<style>
	.literal-style {
		width: 33px;
		height: 33px;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		border-bottom: 1px solid;
	}

	.decision {
		border-color: black;
		color: black;
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.level-expanded {
		border-right: 1px solid transparent;
	}

	.backtracking {
		border-color: #f77777;
		color: #f77777;
	}

	.unit-propagation {
		border-color: #6b788a;
		color: #6b788a;
	}
</style>
