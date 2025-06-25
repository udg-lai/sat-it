<script lang="ts">
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { isBackjumpingReason } from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';
	import { logFatal } from '$lib/stores/toasts.ts';
	import { runningOnChrome } from '$lib/utils.ts';
	import { Popover } from 'flowbite-svelte';
	import { nanoid } from 'nanoid';
	import { onMount } from 'svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast: boolean;
		fromPreviousTrail?: boolean;
	}

	let { assignment, isLast, fromPreviousTrail = false }: Props = $props();
	let buttonId: string = 'btn-' + nanoid();

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

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

	const conflictClauseId: number = $derived(propagatedClause.getTag());

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
</script>

<HeadTailComponent {inspecting}>
	<backtracking class:previous-assignment={fromPreviousTrail}>
		<button
			id={buttonId}
			class="literal-style decision backjumping {onChrome ? 'pad-chrome' : 'pad-others'}"
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</backtracking>
</HeadTailComponent>

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

	:global(.app-popover) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		z-index: 5;
		color: var(--clause-color);
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
		opacity: var(--opacity-50);
	}

	:global(.app-popover > .py-2) {
		padding: 0rem;
	}

	:global(.app-popover > .px-3) {
		padding: 0rem;
	}
</style>
