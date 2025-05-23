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
	import DynamicRender from '../DynamicRender.svelte';
	import { CheckOutline, CloseOutline, HammerOutline } from 'flowbite-svelte-icons';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();

	let buttonId: string = 'btn-' + nanoid();

	const iconProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

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
		<DynamicRender component={CloseOutline} props={iconProps} />
	{:else if clause !== undefined}
		<DynamicRender component={HammerOutline} props={iconProps} />
	{:else if satState}
		<DynamicRender component={CheckOutline} props={iconProps} />
	{/if}
</button>

<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
	<MathTexComponent equation={clause as string} fontSize="var(--popover-font-size)" />
</Popover>

<style>
	.notification {
		pointer-events: none;
		width: 4rem;
		padding-left: 1rem;
		display: flex;
		justify-content: left;
		align-items: center;
		height: var(--trail-content-height);
	}

	.notification.conflict {
		color: var(--backtracking-color);
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
		z-index: 5;
		color: black;
		padding: 0.4rem 0.5rem;
	}

	:global(.app-popover > .py-2) {
		padding: 0rem;
	}

	:global(.app-popover > .px-3) {
		padding: 0rem;
	}
</style>
