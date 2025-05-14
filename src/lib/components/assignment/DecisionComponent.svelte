<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { onMount } from 'svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';

	interface Props {
		assignment: VariableAssignment;
		expanded: boolean;
		emitExpand?: () => void;
		emitClose?: () => void;
	}

	let { assignment, expanded = $bindable(), emitClose, emitExpand }: Props = $props();

	function onClick() {
		expanded = !expanded;
		if (expanded) {
			emitExpand?.();
		} else {
			emitClose?.();
		}
	}

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});
</script>

<decision>
	<button
		class="literal-style decision {onChrome ? 'pad-chrome' : 'pad-others'}"
		class:level-expanded={expanded}
		onclick={onClick}
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</decision>

<style>
	.decision {
		border-color: black;
		color: black;
		border-left: 1px solid;
		border-right: 1px solid;
	}

	.level-expanded {
		border-right: 1px solid transparent;
	}
</style>
