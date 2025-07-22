<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
	}

	let { literal }: Props = $props();
</script>

<div class="breakpoint-component">
	<MathTexComponent equation={literal.toTeX()} />
</div>

<style>
	.breakpoint-component {
		height: var(--literal-height);
		display: flex;
		flex-direction: column;
		justify-content: end;
	}
</style>
