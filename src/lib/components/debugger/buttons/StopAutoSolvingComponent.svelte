<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import '../style.css';
	import stop from '$lib/icons/Pause Auto.svg';

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
</script>

<button class="btn general-btn" onclick={() => solverMachine.stopAutoMode()} title="Stop">
	<ImageRender icon={stop} alt="Pause automatic steps" />
</button>
