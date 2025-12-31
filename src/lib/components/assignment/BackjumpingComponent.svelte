<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { isBackJumpingReason, type Reason } from '$lib/entities/VariableAssignment.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import { Popover } from 'flowbite-svelte';
	import { nanoid } from 'nanoid';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';
	import type { CRef, Lit } from '$lib/types/types.ts';
	import { getFocusedAssignment } from '$lib/states/focused-assignment.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';

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

	const inspectedLiteral: Maybe<Lit> = $derived(getFocusedAssignment());
	let inspecting: boolean = $derived.by(() => {
		if (!isJust(inspectedLiteral)) {
			return false;
		} else {
			const literal: Lit = fromJust(inspectedLiteral);
			return assignment.toLit() === literal && isLast;
		}
	});

	const reasonClause: Clause = $derived.by(() => {
		if (assignment.isBJ()) {
			const reason: Reason = assignment.getReason();
			if (isBackJumpingReason(reason)) {
				return getClausePool().at(reason.cRef);
			} else {
				logFatal('Reason error', 'The reason is not a backjumping');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a backjumping');
		}
	});

	const reasonClauseCRef: CRef = $derived(reasonClause.getCRef());

	const reasonClauseTeX: string = $derived(
		reasonClause
			.map((literal) => {
				return literal.toTeX();
			})
			.join('\\: \\:')
	);

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent display={inspecting}>
	<backtracking class:previous-assignment={fromPreviousTrail}>
		<button
			id={buttonId}
			class="literal-style decision backjumping {chrome ? 'pad-chrome' : 'pad-others'}"
			class:paint-background={detailsExpanded}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>

		<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
			<div class="popover-content">
				<span class="clause-id">{reasonClauseCRef}.</span>
				{#if showUPInfo}
					<MathTexComponent equation={reasonClauseTeX} fontSize="var(--popover-font-size)" />
				{/if}
			</div>
		</Popover>
	</backtracking>
</HeadTailComponent>

<style>
	.backjumping {
		border-color: var(--boolean-constraint-propagation);
		color: var(--boolean-constraint-propagation);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
		border-style: dashed;
		cursor: pointer;
	}

	.previous-assignment {
		color: color-mix(in srgb, var(--boolean-constraint-propagation) 60%, transparent);
	}

	.paint-background {
		position: relative;
		color: var(--satisfied-color);
		background-color: var(--satisfied-color-o);
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
