<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { nanoid } from 'nanoid';
	import { Popover } from 'flowbite-svelte';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { isBacktrackingReason } from '$lib/transversal/entities/VariableAssignment.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	interface Props {
		assignment: VariableAssignment;
		eventClick?: () => void;
	}

	let { assignment, eventClick }: Props = $props();
	let buttonId:string = nanoid();

	let conflictClause: Clause = $derived.by(() => {
		if (assignment.isK()) {
			const reason = assignment.getReason();
			if (isBacktrackingReason(reason)) {
				return $problemStore.clauses.get(reason.clauseId);
			} else {
				logFatal('Reason error', 'The reason is not a backtracking');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a backtracking');
		}
	});

	let conflictClauseString: string = $derived(
		conflictClause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:')
	);

	function onClick() {
		eventClick?.();
	}

</script>

<button id={buttonId} class="literal-style backtracking" onclick={onClick}>
	<MathTexComponent equation={assignment.toTeX()} />
</button>

<Popover triggeredBy={"#" + buttonId} class="si-venga" placement="top">
	<MathTexComponent equation={conflictClauseString} />
</Popover>

<style>
	.backtracking {
		border-color: #f77777;
		color: #f77777;
		border-left: 1px transparent;
		border-right: 1px transparent;
		cursor: help;
	}

	:global(.si-venga) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		color: black;
	}

	:global(mo) {
		margin-bottom: 2px;
	}
</style>
