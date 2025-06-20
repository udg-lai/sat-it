<script lang="ts">
	import ClauseComponent from '$lib/components/ClauseComponent.svelte';
	import { getClausePool } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.svelte.ts';

	let clauses: Clause[] = $derived(getClausePool().getClauses());
</script>

<solution-summary>
	{#each clauses as clause (clause.getTag())}
		<div class="claim">
			{#each clause.getComments() as comment}
				<span class="comment">
					{comment}
				</span>
			{/each}

			<div class="tagged-clause">
				<div class="tag-container">
					<span class="enumerate display">
						{clause.getTag()}.
					</span>
				</div>
				<div class="clause display">
					<ClauseComponent {clause} />
				</div>
			</div>
		</div>
	{/each}
</solution-summary>

<style>
	solution-summary {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 0.5rem 1rem;
		gap: 0.25rem;
	}

	.tag-container {
		display: flex;
		align-items: start;
		width: 3.5rem;
	}

	.claim {
		display: flex;
		width: fit-content;
		height: fit-content;
		flex-direction: column;
		gap: 0.25rem;
		align-items: start;
		padding: 0.25rem 0rem;
	}

	.tagged-clause {
		display: flex;
		flex: 1;
		flex-direction: row;
	}

	.enumerate {
		opacity: 0.5;
		padding-bottom: 0.25rem;
		justify-content: center;
	}

	.comment {
		padding-bottom: 0.5rem;
		color: rgb(107 114 128 / var(--tw-text-opacity, 1));
		background-color: #f6f8fa;
		font-family: monospace;
		font-style: italic;
		display: block;
		margin-bottom: 0.25rem;
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
