<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		assignment: VariableAssignment;
		open?: boolean;
		eventClick?: () => void;
	}

	let clicked = $state(false);

	let { assignment, open = false, eventClick }: Props = $props();

	function onClick() {
		clicked = !clicked;
		eventClick?.();
	}
</script>

{#if assignment.isD()}
	{@render decision()}
{:else if assignment.isK()}
	{@render backtracking()}
{:else}
	{@render up()}
{/if}

{#snippet decision()}
	<button class="literal-style decision" class:level-expanded={clicked || open} onclick={onClick}>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
{/snippet}

{#snippet backtracking()}
	<button class="literal-style decision backtracking">
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
{/snippet}

{#snippet up()}
	<button class="literal-style decision unit-propagation">
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
{/snippet}

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
		border-left: 1px transparent;
		border-right: 1px transparent;
	}

	.unit-propagation {
		border-color: #6b788a;
		color: #6b788a;
	}
</style>
