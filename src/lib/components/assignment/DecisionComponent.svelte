<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getFocusedAssignment } from '$lib/states/focused-assignment.svelte.ts';
	import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
	import type { Lit } from '$lib/types/types.ts';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast: boolean;
		expanded: boolean;
		emitToggle?: () => void;
		fromPreviousTrail?: boolean;
		emitRevertUpToX?: () => void;
	}

	let {
		assignment,
		isLast,
		expanded,
		emitToggle,
		fromPreviousTrail = false,
		emitRevertUpToX
	}: Props = $props();

	let openLevel: boolean = $state(false);

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

	let isOpen: boolean = $state(false);

	$effect(() => {
		openLevel = expanded;
	});

	function emitLevelOpen(): void {
		emitToggle?.();
		openLevel = !openLevel;
		isOpen = !isOpen;
	}

	const emitRevert = (): void => {
		emitRevertUpToX?.();
		isOpen = !isOpen;
	};
</script>

<HeadTailComponent display={inspecting}>
	<decision>
		<button
			class="literal-style decision {chrome ? 'pad-chrome' : 'pad-others'}"
			class:previous-assignment={fromPreviousTrail}
			class:open={openLevel}
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>

		<Dropdown open={isOpen} class="dropdownClass">
			<DropdownItem onclick={emitLevelOpen}>
				<button>
					{#if openLevel}
						Collapse DL
					{:else}
						Open DL
					{/if}
				</button>
			</DropdownItem>
			{#if !fromPreviousTrail}
				<DropdownItem onclick={emitRevert}>
					<button> Revert up to here </button>
				</DropdownItem>
			{/if}
		</Dropdown>
	</decision>
</HeadTailComponent>

<style>
	.decision {
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.previous-assignment {
		color: color-mix(in srgb, var(--decision-color) 60%, transparent);
	}

	.open {
		border-right: 1px solid transparent;
	}
</style>
