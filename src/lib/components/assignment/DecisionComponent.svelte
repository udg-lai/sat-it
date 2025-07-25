<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/inspectedVariable.svelte.ts';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		expanded?: boolean;
		emitToggle?: () => void;
		fromPreviousTrail?: boolean;
		emitRevertUpToX?: () => void;
	}

	let {
		assignment,
		isLast = false,
		expanded = false,
		emitToggle,
		fromPreviousTrail = false,
		emitRevertUpToX
	}: Props = $props();

	let openLevel: boolean = $state(false);

	const inspectedVariable: number = $derived(getInspectedVariable());

	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

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

<HeadTailComponent {inspecting}>
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
