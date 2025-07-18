<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { StopOutline } from 'flowbite-svelte-icons';
	import '../style.css';

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
</script>

<button class="btn general-btn" onclick={() => solverMachine.stopAutoMode()} title="Stop">
	<DynamicRender component={StopOutline} props={{ size: 'md' }} />
</button>
