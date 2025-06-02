<script lang="ts">
	import { Range } from 'flowbite-svelte';
	import { StopOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import './_style.css';
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import { MAX_DELAY_MS, MIN_DELAY_MS, setStepDelay } from '$lib/store/delay-ms.svelte.ts';
	import {
		getBaselineDelay,
		MAX_DELAY,
		MIN_DELAY,
		STEP_DELAY
	} from '$lib/store/parameters.svelte.ts';

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let min = MIN_DELAY;
	let max = MAX_DELAY;
	let step = STEP_DELAY;
	let delay = $state(getBaselineDelay());

	let mappedDelay = $derived(
		MIN_DELAY_MS * (MAX_DELAY_MS / MIN_DELAY_MS) ** ((max - delay) / (max - min))
	);

	$effect(() => {
		setStepDelay(mappedDelay);
	});
</script>

<auto-mode>
	<button class="btn general-btn" onclick={() => solverMachine.stopAutoMode()} title="Stop">
		<DynamicRender component={StopOutline} props={{ size: 'md' }} />
	</button>
	<div class="range">
		<Range id="range-steps" {min} {max} bind:value={delay} {step} size="sm" />
	</div>
</auto-mode>

<style>
	auto-mode {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20rem;
		height: 100%;
		gap: 1rem;
	}

	.range {
		flex: 1;
	}
</style>
