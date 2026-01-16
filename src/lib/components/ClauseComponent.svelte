<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import LiteralComponent from './LiteralComponent.svelte';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		classStyle?: string;
		clause: Clause;
	}

	let { clause, classStyle }: Props = $props();
</script>

<clause class={classStyle ?? ''}>
	{#if clause.isEmpty()}
		<empty-clause>
			
		</empty-clause>
	{:else}
		{#each clause as lit, i (i)}
			<LiteralComponent literal={lit} />
			{#if i < clause.size() - 1}
				<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
			{/if}
		{/each}
	{/if}
</clause>

<style>
	clause {
		color: var(--clause-color);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		padding: 0.25rem;
	}

	empty-clause {
		height: var(--font-size);
		width: var(--font-size);
		color: var(--clause-color);
		border-color: var(--unsatisfied-color);
		border-width: 1px;
	}
</style>
