<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import { nanoid } from 'nanoid';
	import './_style.css';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import { isUnitPropagationReason } from '$lib/transversal/entities/VariableAssignment.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { logFatal } from '$lib/transversal/logging.ts';
	import { Popover } from 'flowbite-svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { onMount } from 'svelte';

	interface Props {
		assignment: VariableAssignment;
	}

	let { assignment }: Props = $props();
	let buttonId: string = 'btn-' + nanoid();

	const propagatedClause: Clause = $derived.by(() => {
		if (assignment.isUP()) {
			const reason = assignment.getReason();
			if (isUnitPropagationReason(reason)) {
				return $problemStore.clauses.get(reason.clauseId);
			} else {
				logFatal('Reason error', 'The reason is not a backtracking');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a backtracking');
		}
	});

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

<unit-propagation>
	<button
		id={buttonId}
		class="literal-style decision unit-propagation {onChrome ? 'pad-chrome' : 'pad-others'}"
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</unit-propagation>

<Popover triggeredBy={'#' + buttonId} class="si-venga" trigger="click" placement="top">
	<MathTexComponent equation={conflictClauseString} />
</Popover>

<style>
	:global(.si-venga) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		color: black;
	}
</style>
