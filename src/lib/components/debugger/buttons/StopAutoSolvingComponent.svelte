<script lang="ts">
	import { asset } from '$app/paths';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import '../style.css';

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
	let stopIcon = asset('/icons/Pause Auto.svg');
</script>

<button class="btn general-btn" onclick={() => solverMachine.stopRunningOnAutomatic()} title="Stop">
	<ImageRender icon={stopIcon} alt="Pause automatic steps" />
</button>
