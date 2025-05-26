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
	import { logError } from '$lib/transversal/logging.ts';
	import { CogOutline } from 'flowbite-svelte-icons';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let baselineDelay: number = $state(getBaselineDelay());

	function updateBaselineDelay(newValue: number) {
		if (!isNaN(newValue) && newValue >= MIN_DELAY) {
			setBaselineDelay(newValue);
		} else {
			logError('Delay error', 'The entered delay is not acceptable');
			baselineDelay = getBaselineDelay();
		}
	}

	const baselinePolarity: boolean = $derived(getBaselinePolarity());

	function togglePolarity(value: boolean) {
		if (value !== baselinePolarity) {
			setBaselinePolarity();
		}
	}
</script>

<div class={headingClass}>
	<DynamicRender component={CogOutline} props={iconClass} />
	<span class="pt-1">General</span>
</div>
<div class={bodyClass}>
	<div class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Delay:</label>
		<input
			id="baselineDelay"
			type="number"
			class="w-32 rounded-lg border border-gray-300 bg-white p-2 text-right focus:outline-none focus:ring-0"
			bind:value={baselineDelay}
			onchange={() => updateBaselineDelay(baselineDelay)}
			min={MIN_DELAY}
			max={MAX_DELAY}
		/>
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
