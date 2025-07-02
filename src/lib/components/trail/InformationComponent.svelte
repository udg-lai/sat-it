<script lang="ts">
	import { SAT_STATE_ID, UNSAT_STATE_ID } from '$lib/solvers/reserved.ts';
	import { nanoid } from 'nanoid';
	import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import { Popover } from 'flowbite-svelte';
	import MathTexComponent from '../MathTexComponent.svelte';
	import DynamicRender from '../DynamicRender.svelte';
	import { CheckOutline, CloseOutline, HammerOutline } from 'flowbite-svelte-icons';

	interface Props {
		trail: Trail;
		isLast: boolean;
	}
	let { trail, isLast }: Props = $props();

	let buttonId: string = 'btn-' + nanoid();

	const problem: Problem = $derived(getProblemStore());
	const iconProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

	const clauseId: number | undefined = $derived(trail.getConflict());
	const clause: string | undefined = $derived.by(() => {
		if (clauseId === undefined) return undefined;
		const clause: Clause = problem.clauses.get(clauseId);
		return clause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:');
	});

	const activeId = $derived(getSolverMachine().getActiveStateId());
	const satState = $derived(activeId === SAT_STATE_ID);
	const unsatState = $derived(activeId === UNSAT_STATE_ID);
</script>

<button
	id={buttonId}
	class="notification"
	class:conflict={clause !== undefined}
	class:unsat={unsatState && isLast}
	class:sat={satState && clause === undefined}
>
	{#if unsatState && isLast}
		<DynamicRender component={CloseOutline} props={iconProps} />
	{:else if clause !== undefined}
		<DynamicRender component={HammerOutline} props={iconProps} />
	{:else if satState}
		<DynamicRender component={CheckOutline} props={iconProps} />
	{/if}
</button>

<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
	<div class="popover-content">
		<span class="clause-id">{clauseId}.</span>
		<MathTexComponent equation={clause as string} fontSize="var(--popover-font-size)" />
	</div>
</Popover>

<style>
	.notification {
		pointer-events: none;
		width: var(--trail-literal-min-width);
		height: var(--trail-literal-min-width);
		display: flex;
		justify-content: center;
		align-items: end;
	}

	.notification.conflict {
		color: var(--conflict-color);
		cursor: pointer;
		pointer-events: auto;
	}

	.notification.unsat {
		color: var(--unsatisfied-color);
	}
	.notification.sat {
		cursor: default;
		color: var(--satisfied-color);
	}

	:global(.app-popover) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		color: black;
		padding: 0.3rem 0.5rem;
	}
	:global(.app-popover .popover-content) {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: var(--popover-font-size);
		gap: 0.5rem;
	}

	:global(.app-popover .clause-id) {
		color: var(--clause-id-color);
	}

	:global(.app-popover > .py-2) {
		padding: 0rem;
	}

	:global(.app-popover > .px-3) {
		padding: 0rem;
	}
</style>
