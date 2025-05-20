<script lang="ts">
	import { SAT_STATE_ID, UNSAT_STATE_ID } from '$lib/machine/reserved.ts';
	import { nanoid } from 'nanoid';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { get } from 'svelte/store';
	import { Popover } from 'flowbite-svelte';
	import MathTexComponent from '../MathTexComponent.svelte';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();

	let buttonId: string = 'btn-' + nanoid();

	const clause: string | undefined = $derived.by(() => {
		const trailEndingClause: number = trail.getTrailEnding();
		if (trailEndingClause === -1) return undefined;
		const clause: Clause = get(problemStore).clauses.get(trailEndingClause);
		return clause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:');
	});

	$effect(() => {
		console.log(clause);
	})

	const activeId = $derived(getSolverMachine().getActiveStateId());
	const satState = $derived(activeId === SAT_STATE_ID);
	const unsatState = $derived(activeId === UNSAT_STATE_ID);
</script>

<button
	id={buttonId}
	class="notification"
	class:conflict={clause !== undefined}
	class:unsat={unsatState}
	class:sat={satState && clause === undefined}
>
	{#if unsatState}
		<p>UNSAT</p>
	{:else if clause !== undefined}
		<p>CONFLICT</p>
	{:else if satState}
		<p>SAT</p>
	{/if}
</button>

<Popover triggeredBy={'#' + buttonId} class="si-venga" trigger="click" placement="bottom">
	<MathTexComponent equation={clause as string} />
</Popover>

<style>
	.notification {
		pointer-events: none;
		width: 6rem;
		padding: 1rem;
		display: flex;
		justify-content: left;
		align-items: center;
	}

	.notification.conflict {
		color: var(--backtracking-color);
		cursor: zoom-in;
		pointer-events: auto;
	}

	.notification.unsat {
		color: var(--unsatisfied-color);
	}
	.notification.sat {
		cursor: default;
		color: var(--satisfied-color);
	}
</style>
