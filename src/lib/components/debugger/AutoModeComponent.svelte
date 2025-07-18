<script lang="ts">
	import { MAX_DELAY_MS, MIN_DELAY_MS, setStepDelay } from '$lib/states/delay-ms.svelte.ts';
	import {
		getBaselineDelay,
		MAX_DELAY,
		MIN_DELAY,
		STEP_DELAY
	} from '$lib/states/parameters.svelte.ts';
	import { Range } from 'flowbite-svelte';
	import StopAutoSolvingComponent from './buttons/StopAutoSolvingComponent.svelte';

	let min = MIN_DELAY;
	let max = MAX_DELAY;
	let step = STEP_DELAY;
	let delay = $state(getBaselineDelay());

	// Chromium does not control the part of the range that is "filled" so we need to create a gradient and add it to the background
	let percentage: number = $derived(((delay - min) / (max - min)) * 100);
	let chromiumBackground: string = $derived(
		`linear-gradient(to right, var(--conflict-color) 0%, var(--conflict-color) ${percentage}%, var(--inspecting-color) ${percentage}%, var(--inspecting-color) 100%)`
	);

	let mappedDelay = $derived(
		MIN_DELAY_MS * (MAX_DELAY_MS / MIN_DELAY_MS) ** ((max - delay) / (max - min))
	);

	$effect(() => {
		setStepDelay(mappedDelay);
	});
</script>

<auto-mode>
	<StopAutoSolvingComponent />
	<div class="range">
		<Range
			id="range-steps"
			{min}
			{max}
			bind:value={delay}
			{step}
			size="sm"
			style="background: {chromiumBackground};"
		/>
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
		display: flex;
		align-items: center;
	}

	:global(.range input[type='range']) {
		-webkit-appearance: none;
		appearance: none;
		/* modify the background color in chromium and macOS web browser */
		&::-webkit-slider-runnable-track {
			height: 3px;
		}
		/* modify the highlighted part of the track in firefox web browser */
		&::-moz-range-progress {
			background-color: var(--conflict-color);
		}
		/* modify the thumb in chromium and macOS web browser */
		&::-webkit-slider-thumb {
			background-color: var(--conflict-color);
			margin-top: -5px;
		}
		/* modify the thumb in firefox web browser */
		&::-moz-range-thumb {
			background-color: var(--conflict-color);
		}
	}
</style>
