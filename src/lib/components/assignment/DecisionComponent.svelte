<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
	import { Dropdown, DropdownItem } from 'flowbite-svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import './style.css';

	interface Props {
		assignment: VariableAssignment;
		isLast?: boolean;
		expanded?: boolean;
		emitToggle?: () => void;
		fromPreviousTrail?: boolean;
		emitUndo?: () => void;
	}

	let {
		assignment,
		isLast = false,
		expanded = false,
		emitToggle,
		fromPreviousTrail = false,
		emitUndo
	}: Props = $props();

	let openLevel: boolean = $state(false);

	const inspectedVariable: number = $derived(getInspectedVariable());

	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let chrome: boolean = $derived(onChrome());

	let isDropdownOpen: boolean = $state(false);

	$effect(() => {
		openLevel = expanded;
	});

	function emitLevelOpen(): void {
		openLevel = !openLevel;
		isDropdownOpen = !isDropdownOpen;
		emitToggle?.();
	}

	const emitAlgorithmicUndo = (): void => {
		isDropdownOpen = !isDropdownOpen;
		emitUndo?.();
	};
</script>

<HeadTailComponent {inspecting}>
	<decision class:previous-assignment={fromPreviousTrail}>
		<button
			class="literal-style decision {chrome ? 'pad-chrome' : 'pad-others'}"
			class:open={openLevel}
			onclick={() => {
				isDropdownOpen = !isDropdownOpen;
			}}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>

		<Dropdown bind:isOpen={isDropdownOpen} simple class="dropdownClass">
			<DropdownItem>
				<button onclick={emitLevelOpen}>
					{#if openLevel}
						Collapse DL
					{:else}
						Open DL
					{/if}
				</button>
			</DropdownItem>
			{#if !fromPreviousTrail}
				<DropdownItem>
					<button onclick={emitAlgorithmicUndo}> Algorithmic Undo </button>
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

	.open {
		border-right: 1px solid transparent;
	}

	:global(.dropdownClass) {
		overflow: visible;
	}
</style>
