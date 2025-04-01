<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { Indicator } from 'flowbite-svelte';

	interface Props {
		assignment: VariableAssignment;
		propagated?: VariableAssignment[];
		onClick?: () => void;
	}

	type IndicatorColor = "teal" | "red" | "none" | "gray" | "yellow" | "green" | "indigo" | "purple" | "blue" | "dark" | "orange" | undefined;

	let { assignment, onClick }: Props = $props();
	let decisionColor: IndicatorColor = $state('teal');

	$effect(() => {
		decisionColor = assignment.isD() ? 'teal' : 'red';
	});

	// let previousIndex = $derived(currentWP < startingWP);
</script>

<div
	class="decision-literal-wrapper"
	class:decide={assignment.isD()}
	class:backtrack={assignment.isK()}
>
	<button class="decision-literal-btn" onclick={onClick}>
		<Indicator placement="top-left" size="md" color={decisionColor} />
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</div>

<style>
	.decision-literal-wrapper {
		background-color: #d3d3d357;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		border-color: var(--border-color);
		border-width: 1px;
	}

	.decision-literal-btn {
		width: 33px;
		height: 33px;
		position: relative;
	}

	.decision-literal-btn,
	.decision-literal-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
