<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import MathTexComponent from './MathTexComponent.svelte';
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';

	interface Props {
		clause: Clause;
	}

	let { clause }: Props = $props();
</script>

<clause>
	{#each clause as lit, i (i)}
		<PlainLiteralComponent literal={lit} />
		{#if i < clause.nLiterals() - 1}
			<div class="lor">
				<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
			</div>
		{/if}
	{/each}
</clause>

<style>
	clause {
		color: var(--clause-color);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		padding: 0 calc(4px + 0.25rem);
	}

	.lor {
		width: var(--trail-literal-min-width);
		height: calc(var(--trail-literal-min-width) - 10px);
		display: flex;
		flex-direction: column;
		justify-content: end;
	}
</style>
