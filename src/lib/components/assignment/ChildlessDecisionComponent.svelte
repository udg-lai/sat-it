<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getFocusedAssignment } from '$lib/states/problem.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import type { Lit } from '$lib/types/types.ts';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';
	import HeadTailComponent from './../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		fromPreviousTrail?: boolean;
		emitRevertUpToX?: () => void;
	}

	let { assignment, isLast = false, fromPreviousTrail = false, emitRevertUpToX }: Props = $props();

	const inspectedLiteral: Maybe<Lit> = $derived(getFocusedAssignment());
	let inspecting: boolean = $derived.by(() => {
		if (!isJust(inspectedLiteral)) {
			return false;
		} else {
			const literal: Lit = fromJust(inspectedLiteral);
			return assignment.toLit() === literal && isLast;
		}
	});

	let chrome: boolean = $derived(onChrome());
	let openOptions: boolean = $state(false);

	const emitRevert = (): void => {
		openOptions = !openOptions;
		emitRevertUpToX?.();
	};
</script>

<HeadTailComponent display={inspecting}>
	<childless-decision class:current-trail={!fromPreviousTrail}>
		<button
			class="literal-style decision level-expanded childless {chrome ? 'pad-chrome' : 'pad-others'}"
			class:previous-assignment={fromPreviousTrail}
			onclick={() => {
				openOptions = !openOptions;
			}}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
	</childless-decision>
</HeadTailComponent>

{#if !fromPreviousTrail}
	<Dropdown open={openOptions} class="dropdownClass">
		<DropdownItem onclick={emitRevert}>
			<button> Revert up to here </button>
		</DropdownItem>
	</Dropdown>
{/if}

<style>
	.decision {
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.level-expanded {
		border-right: 1px solid transparent;
	}

	.childless {
		cursor: unset;
	}

	.previous-assignment {
		color: color-mix(in srgb, var(--decision-color) 60%, transparent);
	}
</style>
