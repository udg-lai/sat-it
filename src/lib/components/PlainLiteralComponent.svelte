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
		width: 100%;
		height: var(--assignment-width);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.satisfied-background {
		background-color: var(--satisfied-color-o);
		border-color: var(--satisfied-border-color-o);
		color: var(--satisfied-color);
	}

	.unsatisfied-background {
		border-color: var(--unsatisfied-border-color-o);
		background-color: var(--unsatisfied-color-o);
	}

	.temporal-background {
		border-color: var(--temporal-color);
	}

	.lemma-background {
		background-color: var(--lemma-color);
		border-color: var(--lemma-border-color);
	}
</style>
