<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import FlexVirtualList from './FlexVirtualList.svelte';
	import ClauseComponent from './ClauseComponent.svelte';

	interface Props {
		clauseHeight?: number;
	}

	let { clauseHeight = 50 }: Props = $props();

	let clauses = $derived.by(() => {
		const problem = $problemStore;
		if (problem === undefined) return [];
		else {
			const allClauses: Clause[] = problem.clauses.getClauses();
			return allClauses;
		}
	});
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
	<div class="statistics"></div>
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
		height: max(10vh, 10rem);
		width: 100%;
		background-color: red;
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
