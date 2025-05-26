<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		getBaselineDelay,
		getBaselinePolarity,
		MAX_DELAY,
		MIN_DELAY,
		setBaselinePolarity
	} from '$lib/store/parameters.svelte.ts';
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

	const baselinePolarity: boolean = $derived(getBaselinePolarity());

	function togglePolarity(value: boolean) {
		if (value !== baselinePolarity) {
			setBaselinePolarity();
		}
	}
</script>

<div class={headingClass}>
	<DynamicRender component={CogOutline} props={iconClass} />
	<span class="pt-1">Parameters</span>
</div>
<div class={bodyClass}>
	<div class="{elementClass} flex items-center justify-between gap-2">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Delay:</label>
		<div class="flex items-center gap-2">
			<button
				onclick={() => baselineDelay = Math.max(MIN_DELAY, baselineDelay - 1)}
				class="{elementClass}"
			>
				−
			</button>
			<input
				id="baselineDelay"
				type="number"
				class="w-20 text-center border border-gray-300 rounded bg-gray-100"
				bind:value={baselineDelay}
				readonly
			/>
			<button
				onclick={() => baselineDelay = Math.min(MAX_DELAY, baselineDelay + 1)}
				class="{elementClass}"
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
