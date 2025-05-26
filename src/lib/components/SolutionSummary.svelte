<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import FlexVirtualList from './FlexVirtualList.svelte';
	import ClauseComponent from './ClauseComponent.svelte';
	import StatisticsComponent from './StatisticsComponent.svelte';

	interface Props {
		clauseHeight?: number;
	}

	let { clauseHeight = 50 }: Props = $props();

	const problem: Problem = $derived(getProblemStore());

	let clauses = $derived(problem.clauses.getClauses());
</script>

<solution-summary>
	<FlexVirtualList items={clauses} itemSize={clauseHeight}>
		<div slot="item" let:item let:index class="clause">
			<div class="enumerate-clause">
				<div class="enumerate">
					<span>
						{index + 1}.
					</span>
				</div>
				<ClauseComponent clause={item as Clause} />
			</div>
		</div>
	</FlexVirtualList>
	<div class="statistics">
		<StatisticsComponent />
	</div>
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

	.statistics {
		height: max(6vh, 6rem);
		width: 100%;
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
