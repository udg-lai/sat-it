<script lang="ts">
	import {
		getCheckingIndex,
		getClausesToCheck
	} from '$lib/store/conflict-detection-state.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';

	const problem: Problem = $derived(getProblemStore());

	let clauses: Clause[] = $derived.by(() => {
		const target: number[] = getClausesToCheck();
		const cPool: ClausePool = problem.clauses;
		return target.map((id) => cPool.get(id));
	});

	let checkingIndex: number = $derived(getCheckingIndex());
</script>

{#each clauses as clause, index (index)}
	<div class="enumerate-clause">
		<div class="enumerate" class:checking={index === checkingIndex}>
			<span>
				{clause.getId()}.
			</span>
		</div>
		<ClauseComponent {clause} />
	</div>
{/each}

<style>
	.enumerate-clause {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		height: 50px;
	}

	.enumerate {
		width: 3.5rem;
		display: flex;
		align-items: end;
		justify-content: center;
		font-size: 1rem;
		opacity: 0.5;
	}

	.checking {
		color: var(--inspecting-color);
		opacity: 1;
	}
</style>
