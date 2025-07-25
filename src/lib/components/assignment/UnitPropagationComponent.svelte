<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { isUnitPropagationReason } from '$lib/entities/VariableAssignment.ts';
	import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';
	import { logFatal } from '$lib/stores/toasts.ts';
	import { Popover } from 'flowbite-svelte';
	import { nanoid } from 'nanoid';
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import './style.css';
	import { getInspectedVariable } from '$lib/states/inspectedVariable.svelte.ts';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		fromPreviousTrail?: boolean;
		detailsExpanded?: boolean;
		showUPInfo?: boolean;
	}

	let {
		assignment,
		isLast = false,
		fromPreviousTrail = false,
		detailsExpanded = false,
		showUPInfo = false
	}: Props = $props();
	let buttonId: string = 'btn-' + nanoid();

	let inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	const problem: Problem = $derived(getProblemStore());
	const propagatedClause: Clause = $derived.by(() => {
		if (assignment.isUP()) {
			const reason = assignment.getReason();
			if (isUnitPropagationReason(reason)) {
				return problem.clauses.get(reason.clauseTag);
			} else {
				logFatal('Reason error', 'The reason is not a unit propagation');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a unit propagation');
		}
	});

	const conflictiveClauseTag: number | undefined = $derived(propagatedClause.getTag());

	const conflictClauseString: string = $derived(
		propagatedClause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:')
	);

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent {inspecting}>
	<unit-propagation class:previous-assignment={fromPreviousTrail}>
		<button
			id={buttonId}
			class="literal-style {chrome ? 'pad-chrome' : 'pad-others'}"
			class:paint-background={detailsExpanded}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>

		<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
			<div class="popover-content">
				<span class="clause-id">{conflictiveClauseTag}.</span>
				{#if showUPInfo}
					<MathTexComponent equation={conflictClauseString} fontSize="var(--popover-font-size)" />
				{/if}
			</div>
		</Popover>
	</unit-propagation>
</HeadTailComponent>

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

	.previous-assignment {
		color: color-mix(in srgb, var(--decision-color) 60%, transparent);
	}

	.paint-background {
		position: relative;
		color: var(--satisfied-color);
		background-color: var(--satisfied-color-o);
	}

	:global(.previous-assignment.paint-background) {
		color: color-mix(in srgb, var(--satisfied-color) 60%, transparent);
	}
</style>
