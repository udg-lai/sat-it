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

<div class="g-conflict" class:selected>
	<div class="conflict-node {chrome ? 'pad-chrome' : 'pad-others'}">
		<MathTexComponent equation={'\\square'} color="--unsatisfied-color" />
	</div>
</div>

<style>
	.conflict-node {
		min-width: var(--assignment-width);
		max-width: var(--assignment-width);
		width: var(--assignment-width);

		min-height: var(--assignment-width);
		max-height: var(--assignment-width);
		height: var(--assignment-width);

		display: flex;
		align-items: end;
		justify-content: center;

		color: var(--unsatisfied-color);
	}

	.g-conflict .conflict-node {
		scale: 1;
	}

	.g-conflict {
		padding: 10px;
		border: 0px solid var(--inspecting-color);
		border-radius: 10%;
		color: var(--conflict-color);
	}
</style>
