<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getProblemStore, updateAlgorithm, type Algorithm } from '$lib/store/problem.svelte.ts';
	import { changeAlgorithmEventBus } from '$lib/transversal/events.ts';
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
</script>

<div class={headingClass}>
	<DynamicRender component={CodePullRequestOutline} props={iconClass} />
	<span class="pt-1">Algorithm</span>
</div>
<div class={bodyClass}>
	<algorithm class={elementClass}>
		<selector class="flex items-center gap-4">
			<label for="algorithm" class="whitespace-nowrap text-gray-900">Algorithm:</label>
			<select
				id="algorithm"
				class="flex-1 rounded-lg border-none text-right outline-none focus:outline-none focus:ring-0"
				onchange={() => {
					updateAlgorithm(currentAlgorithm);
					changeAlgorithmEventBus.emit();
				}}
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
</div>
