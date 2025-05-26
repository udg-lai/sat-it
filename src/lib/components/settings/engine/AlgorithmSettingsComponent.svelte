<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getBaselinePolarity, setBaselinePolarity } from '$lib/store/parameters.svelte.ts';
	import { getProblemStore, updateAlgorithm, type Algorithm } from '$lib/store/problem.svelte.ts';
	import { CodePullRequestOutline } from 'flowbite-svelte-icons';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let currentAlgorithm: Algorithm = $state(getProblemStore().algorithm);
	const availableAlgorithms: Algorithm[] = ['backtracking', 'dpll', 'cdcl'];
	const showCDCL: boolean = $derived(currentAlgorithm === 'cdcl');

	const baselinePolarity: boolean = $derived(getBaselinePolarity());

	function togglePolarity(value: boolean) {
		if (value !== baselinePolarity) {
			setBaselinePolarity();
		}
	}
</script>

<div class={headingClass}>
	<DynamicRender component={CodePullRequestOutline} props={iconClass} />
	<span class="pt-1">Algorithm Settings</span>
</div>
<div class="{bodyClass} gap-3">
	<algorithm class={elementClass}>
		<selector class="flex items-center gap-4">
			<label for="algorithm" class="whitespace-nowrap text-gray-900">Algorithm:</label>
			<select
				id="algorithm"
				class="flex-1 rounded-lg border-none outline-none focus:outline-none focus:ring-0"
				onchange={() => updateAlgorithm(currentAlgorithm)}
				bind:value={currentAlgorithm}
			>
				{#each availableAlgorithms as algorithm}
					<option value={algorithm} selected={algorithm === currentAlgorithm}>
						{algorithm}
					</option>
				{/each}
			</select>
		</selector>
		<div
			class="overflow-hidden transition-all duration-300 ease-in-out"
			style="max-height: {showCDCL ? '20rem' : '0'}"
		>
			<div class="mt-4 h-[20rem] w-full rounded-lg bg-[var(--main-bg-color)]"></div>
		</div>
	</algorithm>
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
