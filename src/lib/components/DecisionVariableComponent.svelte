<script lang="ts">
	import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		decision: DecisionVariable;
		startingWP: number;
		currentWP: number;
	}
	let { decision, startingWP, currentWP }: Props = $props();
	let previousIndex = $derived(currentWP < startingWP);
</script>

<div
	class="trail"
	class:decide={decision.isD() && !previousIndex}
	class:decidePrevious={decision.isD() && previousIndex}
	class:unit-propagation={decision.isUP() && !previousIndex}
	class:unit-propagationPrevious={decision.isUP() && previousIndex}
	class:backtrack={decision.isK() && !previousIndex}
	class:backtrackPrevious={decision.isK() && previousIndex}
>
	<MathTexComponent equation={decision.toTeX()} />
</div>

<style>
	.trail {
		display: flex;
		align-items: center;
		font-size: 25px;
		padding-right: 5px;
		padding-left: 5px;
	}
	.decide {
		color: var(--decide-color);
		--decide-color: #1434a4;
	}

	.decidePrevious {
		color: var(--decide-previous);
		--decide-previous: #1433a48e;
	}

	.unit-propagation {
		color: var(--unit-propagation-color);
		--unit-propagation-color: #36454f;
	}

	.unit-propagationPrevious {
		color: var(--unit-propagationPrevious);
		--unit-propagationPrevious: #36454f8e;
	}

	.backtrack {
		color: var(--backtrack-color);
		--backtrack-color: #e7aa00;
	}
	.backtrackPrevious {
		color: var(--backtracking-previous);
		--backtracking-previous: #e7a9007e;
	}
</style>
