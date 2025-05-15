<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { onMount } from 'svelte';
	import { runningOnChrome } from '$lib/transversal/utils.ts';

	interface Props {
		assignment: VariableAssignment;
	}

	let { assignment }: Props = $props();

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});
</script>

<childless-decision>
	<button
		class="literal-style decision level-expanded childless {onChrome ? 'pad-chrome' : 'pad-others'}"
	>
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</childless-decision>

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

	.childless {
		cursor: unset;
	}
</style>
