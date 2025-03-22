<script lang="ts">
	import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { Indicator } from 'flowbite-svelte';

	interface Props {
		decision: DecisionVariable;
		onClick?: () => void;
	}
	let { decision, onClick }: Props = $props();
	let decisionColor: string = $state('teal');

	$effect(() => {
		decisionColor = decision.isD() ? 'teal' : 'red';
	});

	// let previousIndex = $derived(currentWP < startingWP);
</script>

<div
	class="decision-literal-wrapper"
	class:decide={decision.isD()}
	class:backtrack={decision.isK()}
>
	<button class="decision-literal-btn" onclick={onClick}>
		<Indicator placement="top-left" size="md" color={decisionColor} />
		<MathTexComponent equation={decision.toTeX()} />
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

	.decide {
	}

	.backtrack {
	}
</style>
