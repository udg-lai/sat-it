<script lang="ts">
	import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import IndicatorComponent from './IndicatorComponent.svelte';

	interface Props {
		decisionVariable: DecisionVariable;
		onClick?: () => void;
		onEnter?: () => void;
		onLeave?: () => void;
	}
	let { decisionVariable, onClick, onEnter, onLeave }: Props = $props();

	// let previousIndex = $derived(currentWP < startingWP);
</script>

<div class="decision-literal">
	<div class="indicator">
		<IndicatorComponent reason={decisionVariable.reason} />
	</div>
	<button
		class="decision-literal-btn"
		onmouseleave={onLeave}
		onmouseenter={onEnter}
		onclick={onClick}
	>
		<MathTexComponent equation={decisionVariable.toTeX()} />
	</button>
</div>

<style>
	.decision-literal {
		height: 4rem;
		width: 4rem;
		position: relative;
	}

	.indicator {
		position: absolute;
		bottom: -15px;
		z-index: 100;
	}

	.decision-literal-btn {
		border-color: var(--border-color);
		border-width: 1px;
		background-color: #d3d3d357;
		height: 100%;
		width: 100%;
		position: relative;
	}

	.decision-literal,
	.decision-literal-btn {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
