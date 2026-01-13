<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { isUnitPropagationReason } from '$lib/entities/VariableAssignment.ts';
	import { getFocusedAssignment } from '$lib/states/focused-assignment.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import type { CRef, Lit } from '$lib/types/types.ts';
	import { Popover } from 'flowbite-svelte';
	import { nanoid } from 'nanoid';
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import './style.css';

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
		detailsExpanded = false
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
		if (assignment.isUP()) {
			const reason = assignment.getReason();
			if (isUnitPropagationReason(reason)) {
				return getClausePool().at(reason.cRef);
			} else {
				logFatal('Reason error', 'The reason is not a unit propagation');
			}
		} else {
			logFatal('Reason error', 'The variable assignment is not a unit propagation');
		}
	});

	const reasonCRef: CRef = $derived(reasonClause.getCRef());

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent display={inspecting}>
	<unit-propagation class:previous-assignment={fromPreviousTrail}>
		<button
			id={buttonId}
			class="literal-style {chrome ? 'pad-chrome' : 'pad-others'}"
			class:paint-background={detailsExpanded}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</unit-propagation>
</HeadTailComponent>

<Popover triggeredBy={'#' + buttonId} class="app-popover" trigger="click" placement="bottom">
	<div class="popover-content">
		<button>
			<span class="clause-id">{reasonCRef}</span>
		</button>
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

	:global(.popover-content button) {
		width: var(--assignment-width);
		font-size: var(--popover-font-size);
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
