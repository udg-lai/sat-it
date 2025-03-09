<script lang="ts">
	import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { Indicator } from 'flowbite-svelte';

	interface Props {
		decision: DecisionVariable;
	}
	let { decision }: Props = $props();
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
	<div class="decision-literal">
		<Indicator placement="bottom-right" size="md" color={decisionColor} />
		<MathTexComponent equation={decision.toTeX()} />
	</div>
</div>

<style>
	.decision-literal-wrapper {
		background-color: #d3d3d357;
		width: 4rem;
		height: 4rem;
		border-radius: 45%;
		border-color: #424242;
		border-width: 1px;
	}

	.decision-literal {
		width: 35px;
		height: 35px;
		position: relative;
	}

	.decision-literal,
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
