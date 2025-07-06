<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
	}

	let { literal }: Props = $props();
</script>

<div class="literal-component">
	<MathTexComponent equation={literal.toTeX()} />
</div>

<style>
	.literal-component {
		width: var(--trail-literal-min-width);
		height: var(--trail-height);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
