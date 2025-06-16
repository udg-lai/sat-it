<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { nanoid } from 'nanoid';
	import './_style.css';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import { isBackjumpingReason } from '$lib/transversal/entities/VariableAssignment.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { Popover } from 'flowbite-svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { onMount } from 'svelte';
	import { logFatal } from '$lib/store/toasts.ts';
	import { getInspectedVariable } from '$lib/store/conflict-detection-state.svelte.ts';

	interface Props {
		assignment: VariableAssignment;
		isLast: boolean;
	}

	let { assignment, isLast }: Props = $props();
	let buttonId: string = 'btn-' + nanoid();

	const problem: Problem = $derived(getProblemStore());
	const propagatedClause: Clause = $derived.by(() => {
		if (assignment.isBJ()) {
			const reason = assignment.getReason();
			if (isBackjumpingReason(reason)) {
				return problem.clauses.get(reason.clauseId);
			} else {
				logFatal('Reason error', 'The reason is not a backjumping');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a backjumping');
		}
	});

	const conflictClauseId: number = $derived(propagatedClause.getId());

	const conflictClauseString: string = $derived(
		propagatedClause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:')
	);

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});

	const inspectedVariable: number = $derived(getInspectedVariable());
</script>

<backtracking>
	<button
		id={buttonId}
		class="literal-style decision backjumping {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:inspecting={assignment.variableId() === inspectedVariable && isLast}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</backtracking>

<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
	<div class="popover-content">
		<span class="clause-id">{conflictClauseId}.</span>
		<MathTexComponent equation={conflictClauseString} fontSize="var(--popover-font-size)" />
	</div>
</Popover>

<style>
	.backjumping {
		border-color: var(--conflict-color);
		color: var(--conflict-color);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
		border-style: dashed;
		cursor: pointer;
	}

	.inspecting {
		color: var(--inspecting-color);
		border-color: var(--inspecting-color);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
	}

	:global(.app-popover) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		z-index: 5;
		color: black;
		padding: 0.4rem 0.5rem;
	}

	:global(.app-popover .popover-content) {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: var(--popover-font-size);
		gap: 0.5rem;
	}

	:global(.app-popover .clause-id) {
		opacity: 0.5;
	}

	:global(.app-popover > .py-2) {
		padding: 0rem;
	}

	:global(.app-popover > .px-3) {
		padding: 0rem;
	}
</style>
