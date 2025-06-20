<script lang="ts">
	import ClauseComponent from '$lib/components/ClauseComponent.svelte';
	import FlexVirtualList from '$lib/components/FlexVirtualList.svelte';
	import { getClausePool } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.svelte.ts';

	interface Props {
		clauseHeight?: number;
	}

	let { clauseHeight = 50 }: Props = $props();

	let clauses: Clause[] = $derived(getClausePool().getClauses());
</script>

<solution-summary>
	<FlexVirtualList items={clauses} itemSize={clauseHeight}>
		<div slot="item" let:item class="clause-item">

			{#each (item as Clause).getComments() as comment}
				{comment}
			{/each}


			<div class="enumerate display">
				<span>
					{(item as Clause).getId()}.
				</span>
			</div>
			<div class="clause display">
				<ClauseComponent clause={item as Clause} />
			</div>
		</div>
	</FlexVirtualList>
</solution-summary>

<style>
	solution-summary {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.clause-item {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
	}

	.enumerate {
		opacity: 0.5;
		width: 3.5rem;
		padding-bottom: 0.25rem;
		justify-content: center;
	}

	.display {
		height: 100%;
		display: flex;
		align-items: end;
		font-size: 1rem;
	}

	.display.clause {
		flex: 1;
	}
</style>
