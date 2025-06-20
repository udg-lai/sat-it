<script lang="ts">
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { nanoid } from 'nanoid';
	import './_style.css';
	import type Clause from '$lib/transversal/entities/Clause.svelte.ts';
	import { isUnitPropagationReason } from '$lib/transversal/entities/VariableAssignment.ts';
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

	let inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	const problem: Problem = $derived(getProblemStore());
	const propagatedClause: Clause = $derived.by(() => {
		if (assignment.isUP()) {
			const reason = assignment.getReason();
			if (isUnitPropagationReason(reason)) {
				return problem.clauses.get(reason.clauseId);
			} else {
				logFatal('Reason error', 'The reason is not a backtracking');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a backtracking');
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
</script>

<HeadTailComponent {inspecting}>
	<unit-propagation>
		<button
			id={buttonId}
			class="literal-style decision unit-propagation {onChrome ? 'pad-chrome' : 'pad-others'}"
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</unit-propagation>
</HeadTailComponent>

<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
	<div class="popover-content">
		<span class="clause-id">{conflictClauseId}.</span>
		<MathTexComponent equation={conflictClauseString} fontSize="var(--popover-font-size)" />
	</div>
</Popover>

<style>
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
