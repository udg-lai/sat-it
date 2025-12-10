<script lang="ts">
	import SolveTrailComponent from './buttons/SolveTrailComponent.svelte';
	import SolveAutomaticComponent from './buttons/SolveAutomaticComponent.svelte';
	import SolveProblemComponent from './buttons/SolveProblemComponent.svelte';

	interface Props {
		finished: boolean;
		backtrackingState: boolean;
	}

	let { finished, backtrackingState }: Props = $props();
</script>

<general-debugger>
	<SolveTrailComponent {finished} {backtrackingState} />

	<SolveProblemComponent {finished} {backtrackingState} />

	<SolveAutomaticComponent {finished} {backtrackingState} />
</general-debugger>

<style>
	general-debugger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
