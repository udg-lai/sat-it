<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { changeAlgorithmEventBus } from '$lib/events/events.ts';
	import { type Algorithm } from '$lib/types/algorithm.ts';
	import { Modal } from 'flowbite-svelte';
	import { CodePullRequestOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { getConfiguredAlgorithm, setConfiguredAlgorithm } from './state.svelte.ts';

	interface Props {
		iconClass: { size: string };
	}

	let { iconClass }: Props = $props();

	let initialAlgorithm = getConfiguredAlgorithm();

	let algorithmSelected: Algorithm = $state(
		initialAlgorithm === 'twatch' ? 'cdcl' : initialAlgorithm
	);

	let is2WatchEnabled: boolean = $state(initialAlgorithm === 'twatch');

	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	const availableAlgorithms: Algorithm[] = ['backtracking', 'dpll', 'cdcl'];
	const showCDCL: boolean = $derived(algorithmSelected === 'cdcl');

	let openModal: boolean = $state(false);

	const cancelChange = () => {
		openModal = false;
		const currentAlgorithm = getConfiguredAlgorithm();
		algorithmSelected = currentAlgorithm === 'twatch' ? 'cdcl' : currentAlgorithm;
		is2WatchEnabled = currentAlgorithm === 'twatch';
	};

	const acceptChange = (algorithmSelected: Algorithm) => {
		openModal = false;

		const finalAlgorithm =
			algorithmSelected === 'cdcl' && is2WatchEnabled ? 'twatch' : algorithmSelected;

		setConfiguredAlgorithm(finalAlgorithm);
		changeAlgorithmEventBus.emit(finalAlgorithm);
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
				class="flex-1 cursor-pointer rounded-lg border-[var(--border-color)] text-right outline-none focus:outline-none focus:ring-0"
				onchange={() => (openModal = true)}
				bind:value={algorithmSelected}
			>
				{#each availableAlgorithms as algorithm}
					<option value={algorithm} selected={algorithm === algorithmSelected}>
						{algorithm}
					</option>
				{/each}
			</select>
		</selector>
		<div
			class="overflow-hidden transition-all duration-300 ease-in-out"
			style="max-height: {showCDCL ? '20rem' : '0'}"
		>
			{#if showCDCL}
				<div class="extra-options">
					<label for="twatch-toggle">2-Watched Literals</label>
					<input
						id="twatch-toggle"
						type="checkbox"
						class="classic-checkbox"
						bind:checked={is2WatchEnabled}
						onchange={() => (openModal = true)}
					/>
				</div>
			{/if}
		</div>
	</algorithm>
</div>

<Modal bind:open={openModal} size="xs" class="modal-style" dismissable={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
		<h3 class="mb-5 text-lg font-normal text-gray-600">
			By changing the algorithm, all the assignments made will be erased. Are you sure?
		</h3>
		<button class="btn mr-4" onclick={() => acceptChange(algorithmSelected)}>Yes, I'm sure</button>
		<button class="btn" onclick={cancelChange}>
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

	.classic-checkbox {
		width: 15px;
		height: 15px;
		cursor: pointer;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
	}

	.extra-options {
		margin-top: 10px;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
	}
</style>
