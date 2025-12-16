<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getFocusedAssignment } from '$lib/states/focused-assignment.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import type { Lit } from '$lib/types/types.ts';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		fromPreviousTrail?: boolean;
		eventClick?: () => void;
	}

	let { assignment, isLast = false, fromPreviousTrail = false, eventClick }: Props = $props();

	const inspectedLiteral: Maybe<Lit> = $derived(getFocusedAssignment());
	let inspecting: boolean = $derived.by(() => {
		if (!isJust(inspectedLiteral)) {
			return false;
		} else {
			const literal: Lit = fromJust(inspectedLiteral);
			return assignment.toLit() === literal && isLast;
		}
	});

	function onClick() {
		eventClick?.();
	}

	let chrome: boolean = $derived(onChrome());
</script>

<HeadTailComponent display={inspecting}>
	<backtracking class:previous-assignment={fromPreviousTrail}>
		<button
			class="literal-style backtracking {chrome ? 'pad-chrome' : 'pad-others'}"
			onclick={onClick}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</backtracking>
</HeadTailComponent>

<style>
	.backtracking {
		border-color: var(--conflict-color);
		color: var(--conflict-color);
		border-top: 1px transparent;
		border-left: 1px transparent;
		border-right: 1px transparent;
		border-style: dashed;
		cursor: unset;
	}

	.previous-assignment {
		color: color-mix(in srgb, var(--conflict-color) 60%, transparent);
	}

	:global(mover mo) {
		margin-bottom: 3px;
	}
</style>
