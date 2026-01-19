<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
		state: 'unsatisfied' | 'satisfied';
	}

	let { literal, state = 'satisfied' }: Props = $props();
</script>

<plain-literal
	class="literal-component"
	class:satisfied={state === 'satisfied'}
	class:unsatisfied={state === 'unsatisfied'}
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

	.satisfied {
		color: var(--satisfied-color);
	}

	.unsatisfied {
		color: var(--unsatisfied-color);
	}
</style>
