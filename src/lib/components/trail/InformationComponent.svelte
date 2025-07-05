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
	import { ArrowUpRightDownLeftOutline, CheckOutline, CloseOutline, HammerOutline, HorizontalLinesOutline, MinimizeOutline } from 'flowbite-svelte-icons';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { on } from 'svelte/events';

	interface Props {
		isLast: boolean;
		onToggleExpand?: () => void;
		expanded: boolean
	}

	let {  isLast, onToggleExpand, expanded }: Props = $props();

	let buttonId: string = 'btn-' + nanoid();

	const problem: Problem = $derived(getProblemStore());
	const iconProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

	const solver: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());


	function onToggleExpandClick() {
		onToggleExpand?.();
	}


	const activeId = $derived(solver.getActiveStateId());
	const satState = $derived(activeId === SAT_STATE_ID);
	const unsatState = $derived(activeId === UNSAT_STATE_ID);
</script>

	<button onclick={onToggleExpandClick} >
		<DynamicRender component={expanded ? MinimizeOutline : HorizontalLinesOutline} props={iconProps} />
	</button>


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
