<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		getBaselineDelay,
		getBaselinePolarity,
		MAX_DELAY,
		MIN_DELAY,
		setBaselineDelay,
		setBaselinePolarity
	} from '$lib/store/parameters.svelte.ts';
	import { CogOutline } from 'flowbite-svelte-icons';

	interface Props {
		iconClass: { size: string };
	}

	let { iconClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let baselineDelay: number = $state(getBaselineDelay());

	const baselinePolarity: boolean = $derived(getBaselinePolarity());

	function togglePolarity(value: boolean) {
		if (value !== baselinePolarity) {
			setBaselinePolarity();
		}
	}
</script>

<div class="heading-class">
	<DynamicRender component={CogOutline} props={iconClass} />
	<span class="pt-1">Parameters</span>
</div>
<div class="body-class">
	<div class="{elementClass} flex items-center justify-between gap-2">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Delay:</label>
		<div class="flex items-center gap-2">
			<button
				onclick={() => {
					baselineDelay = Math.max(MIN_DELAY, baselineDelay - 1);
					setBaselineDelay(baselineDelay);
				}}
				class="delay-buttons"
				class:inactive={baselineDelay === MIN_DELAY}
			>
				−
			</button>
			<input
				id="baselineDelay"
				type="number"
				class="w-20 rounded border border-[var(--border-color)] py-0 text-center leading-none"
				bind:value={baselineDelay}
				readonly
			/>
			<button
				onclick={() => {
					baselineDelay = Math.min(MAX_DELAY, baselineDelay + 1);
					setBaselineDelay(baselineDelay);
				}}
				class="delay-buttons"
				class:inactive={baselineDelay === MAX_DELAY}
			>
				+
			</button>
		</div>
	</div>
	<polarity class={elementClass}>
		<div class="flex w-full items-center justify-between">
			<span class="pr-2">Polarity:</span>
			<div class="inline-flex rounded-lg" role="group">
				<button
					class={`border border-gray-200 px-4 py-2 transition-colors duration-300 ${
						baselinePolarity
							? 'bg-[var(--icon-base)] text-white'
							: 'bg-white hover:bg-[var(--icon-light)]'
					} rounded-l-lg`}
					onclick={() => togglePolarity(true)}
				>
					True
				</button>
				<button
					class={`border border-gray-200 px-4 py-2 transition-colors duration-300 ${
						!baselinePolarity
							? 'bg-[var(--icon-base)] text-white'
							: 'bg-white hover:bg-[var(--icon-light)]'
					} rounded-r-lg`}
					onclick={() => togglePolarity(false)}
				>
					False
				</button>
			</div>
		</div>
	</polarity>
</div>

<style>
	.delay-buttons {
		height: 100%;
		width: 2rem;
		border: solid;
		border-color: var(--border-color);
		border-radius: 0.5rem;
		border-width: 1px;
		background-color: white;
		transition: background-color 300ms;
	}

	.delay-buttons:hover {
		background-color: var(--main-bg-color);
	}

	.delay-buttons:active {
		background-color: var(--lighter-bg-color);
	}

	.delay-buttons.inactive {
		background-color: var(--border-color);
		pointer-events: none;
	}
</style>
