<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
		state?: 'unsatisfied' | 'satisfied';
		learned?: boolean;
	}

	let { literal, state = undefined, learned = false }: Props = $props();
</script>

<plain-literal
	class="literal-component"
	class:satisfied-background={state === 'satisfied'}
	class:unsatisfied-background={state === 'unsatisfied'}
	class:temporal-background={state === undefined && !learned}
	class:lemma-background={learned}
>
	<MathTexComponent equation={literal.toTeX()} />
</plain-literal>

<style>
	.literal-component {
		width: var(--plain-literal-width);
		height: var(--plain-literal-height);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.satisfied-background {
		background-color: var(--satisfied-color-o);
		border-left: 1px solid;
		border-right: 1px solid;
		border-color: var(--satisfied-border-color-o);
	}

	.unsatisfied-background {
		border-left: 1px solid;
		border-right: 1px solid;
		border-color: var(--unsatisfied-border-color-o);
		background-color: var(--unsatisfied-color-o);
	}

	.temporal-background {
		border-left: 1px solid;
		border-right: 1px solid;
		border-color: var(--temporal-color);
	}

	.lemma-background {
		background-color: var(--lemma-color);
		border-left: 1px solid;
		border-right: 1px solid;
		border-color: var(--lemma-border-color);
	}
</style>
