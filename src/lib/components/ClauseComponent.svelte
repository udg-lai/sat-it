<script lang="ts">
	import Clause from '$lib/transversal/entities/Clause.ts';
	import LiteralComponent from './LiteralComponent.svelte';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		clause: Clause;
	}

	let { clause }: Props = $props();

	let height: string = '25px';
</script>

<div class="clause-style">
	<div class="bracket" style="--clause-height:{height}">
		<MathTexComponent equation={'\\bigl\\{'} />
	</div>
	{#each clause as lit}
		<LiteralComponent literal={lit} {height} />
	{/each}
	<div class="bracket" style="--clause-height:{height}">
		<MathTexComponent equation={'\\bigl\\}'} />
	</div>
</div>

<style>
	.clause-style {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
	}

	.bracket {
		height: var(--clause-height);
		display: flex;
		flex-direction: column;
		justify-content: end;
	}
</style>
