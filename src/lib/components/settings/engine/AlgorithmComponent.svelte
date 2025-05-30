<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getProblemStore, updateAlgorithm, type Algorithm } from '$lib/store/problem.svelte.ts';
	import { getTrails } from '$lib/store/trails.svelte.ts';
	import { changeAlgorithmEventBus } from '$lib/transversal/events.ts';
	import { Modal } from 'flowbite-svelte';
	import { CodePullRequestOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';

	interface Props {
		iconClass: { size: string };
	}

	let resetModal: boolean = $state(false);

	let { iconClass }: Props = $props();
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

<div class="heading-class">
	<DynamicRender component={CodePullRequestOutline} props={iconClass} />
	<span class="pt-1">Algorithm</span>
</div>
<div class="body-class">
	<algorithm class={elementClass}>
		<selector class="flex items-center gap-4">
			<label for="algorithm">Algorithm:</label>
			<select
				id="algorithm"
				class="flex-1 rounded-lg border-[var(--border-color)] text-right outline-none focus:outline-none focus:ring-0"
				onchange={() => {
					if (getTrails().length !== 0) resetModal = true;
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

<Modal bind:open={resetModal} size="xs" class="modal-style" dismissable={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
		<h3 class="mb-5 text-lg font-normal text-gray-600">
			By changing the algorithm, all your trail progress will be lost. Are you sure?
		</h3>
		<button class="btn mr-4" onclick={confirmUpdate}>Yes, I'm sure</button>
		<button
			class="btn"
			onclick={() => {
				resetModal = false;
				currentAlgorithm = getProblemStore().algorithm;
			}}
		>
			<span>No, cancel</span>
		</button>
	</div>
</Modal>

<style>
	.modal-style {
		background-color: var(--main-bg-color);
		color: black;
	}

	.btn {
		border: solid;
		border-width: 1px;
		border-radius: 0.5rem;
		border-color: var(--border-color);
		padding: 0.75rem;
	}
</style>
