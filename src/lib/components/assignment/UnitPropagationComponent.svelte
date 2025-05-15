<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';
	import './_style.css';
	import { runningOnChrome } from '$lib/transversal/utils.ts';
	import { onMount } from 'svelte';

	interface Props {
		assignment: VariableAssignment;
	}

	let { assignment }: Props = $props();

	let onChrome = $state(false);

	onMount(() => {
		onChrome = runningOnChrome();
	});
</script>

<unit-propagation>
	<button class="literal-style decision unit-propagation {onChrome ? 'pad-chrome' : 'pad-others'}">
		<MathTexComponent equation={assignment.toTeX()} />
	</button>
</unit-propagation>
