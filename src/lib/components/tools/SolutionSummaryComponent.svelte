<script lang="ts">
	import ClauseComponent from '$lib/components/ClauseComponent.svelte';
	import FlexVirtualList from '$lib/components/FlexVirtualList.svelte';
	import { getClausePool } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';

	interface Props {
		clauseHeight?: number;
	}

	let { clauseHeight = 50 }: Props = $props();

	let clauses: Clause[] = $derived(getClausePool().getClauses());
</script>

<solution-summary>
	<FlexVirtualList items={clauses} itemSize={clauseHeight}>
		<div slot="item" let:item class="clause">
			<div class="enumerate-clause">
				<div class="enumerate">
					<span>
						{(item as Clause).getId()}.
					</span>
				</div>
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

	.clause {
		height: 100%;
	}

	.enumerate-clause {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
	}

	.enumerate {
		width: 3.5rem;
		display: flex;
		align-items: end;
		justify-content: center;
		font-size: 1rem;
		opacity: 0.5;
	}
</style>
