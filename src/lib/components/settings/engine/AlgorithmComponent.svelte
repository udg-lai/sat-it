<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getProblemStore, updateAlgorithm, type Algorithm } from '$lib/store/problem.svelte.ts';
	import { changeAlgorithmEventBus } from '$lib/transversal/events.ts';
	import { Modal } from 'flowbite-svelte';
	import { CodePullRequestOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let resetModal: boolean = $state(false);

	let { headingClass, iconClass, bodyClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let currentAlgorithm: Algorithm = $state(getProblemStore().algorithm);
	const availableAlgorithms: Algorithm[] = ['backtracking', 'dpll', 'cdcl'];
	const showCDCL: boolean = $derived(currentAlgorithm === 'cdcl');

	const confirmUpdate = () => {
		resetModal = false;
		updateAlgorithm(currentAlgorithm);
		changeAlgorithmEventBus.emit();
	};
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
					resetModal = true;
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

<Modal bind:open={resetModal} size="xs" autoclose transition={slide}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400" />
		<h3 class="mb-5 text-lg font-normal text-gray-500">
			By doing action, all your trail progress will be lost. Are you sure?
		</h3>
		<button color="red" class="me-2" onclick={confirmUpdate}>Yes, I'm sure</button>
		<button
			color="alternative"
			onclick={() => {
				resetModal = false;
				currentAlgorithm = getProblemStore().algorithm;
			}}>No, cancel</button
		>
	</div>
</Modal>
