<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getInspectedVariable } from '$lib/states/conflict-detection-state.svelte.ts';
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

	const inspectedVariable: number = $derived(getInspectedVariable());
	let inspecting: boolean = $derived(assignment.variableId() === inspectedVariable && isLast);

	let chrome: boolean = $derived(onChrome());
	let isOpen: boolean = $state(false);

	const emitRevert = (): void => {
		isOpen = !isOpen;
		emitRevertUpToX?.();
	};
</script>

<HeadTailComponent {inspecting}>
	<childless-decision class:current-trail={!fromPreviousTrail}>
		<button
			class="literal-style decision level-expanded childless {chrome ? 'pad-chrome' : 'pad-others'}"
			class:previous-assignment={fromPreviousTrail}
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			<MathTexComponent equation={assignment.toTeX()} />
		</button>
		{#if !fromPreviousTrail}
			<Dropdown open={isOpen} placement="bottom" class="dropdownClass">
				<DropdownItem onclick={emitRevert}>Revert up to here</DropdownItem>
			</Dropdown>
		{/if}
	</childless-decision>
</HeadTailComponent>

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

	:global(.dropdownClass) {
		overflow: visible;
	}
</style>
