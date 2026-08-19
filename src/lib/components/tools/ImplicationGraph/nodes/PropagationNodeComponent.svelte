<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import Literal from '$lib/entities/Literal.svelte.ts';
	import type { Lit } from '$lib/types/types.ts';

	let {
		id,
		selected
	}: {
		id: string;
		selected: boolean;
	} = $props();

	let chrome: boolean = $derived(onChrome());

	let literal: Lit = $derived(Number(id));
</script>

<div class="g-propagation" class:selected>
	<div class="literal-node {chrome ? 'pad-chrome' : 'pad-others'}">
		<MathTexComponent equation={Literal.toTeX(literal)} />
	</div>
</div>

<style>
	.literal-node {
		min-width: var(--assignment-width);
		max-width: var(--assignment-width);
		width: var(--assignment-width);

		min-height: var(--assignment-width);
		max-height: var(--assignment-width);
		height: var(--assignment-width);

		display: flex;
		align-items: end;
		justify-content: center;

		border-bottom: 1px solid;

		font-size: var(--font-size);
	}

	.g-propagation .literal-node {
		scale: 1;
	}

	@keyframes pulse {
		0%,
		100% {
			scale: 1;
		}

		50% {
			scale: 1.2;
		}
	}

	.g-propagation.selected .literal-node {
		color: var(--satisfied-color);
	}

	.g-propagation {
		border-radius: 10%;
		padding: 10px;

		scale: 1;
		transition: scale 0.2s ease-in-out;
	}
</style>
