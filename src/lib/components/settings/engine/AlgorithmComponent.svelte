<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { changeAlgorithmEventBus } from '$lib/events/events.ts';
	import { type Algorithm } from '$lib/types/algorithm.ts';
	import { Modal } from 'flowbite-svelte';
	import { CodePullRequestOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { getConfiguredAlgorithm, setConfiguredAlgorithm } from './state.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	interface Props {
		iconClass: { size: string };
	}

	let { iconClass }: Props = $props();

	type LocalAlgorithm = 'backtracking' | 'dpll' | 'cdcl';

	let configuredAlgorithm: LocalAlgorithm = $state(
		getConfiguredAlgorithm() === 'twatch' ? 'cdcl' : (getConfiguredAlgorithm() as LocalAlgorithm)
	);

	const showCDCL: boolean = $derived(configuredAlgorithm === 'cdcl');

	let twatchActivated: boolean = $derived(getConfiguredAlgorithm() === 'twatch');
	let twatchToggled: boolean = $state(getConfiguredAlgorithm() === 'twatch');

	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	const availableAlgorithms: Algorithm[] = ['backtracking', 'dpll', 'cdcl'];

	let openModal: boolean = $state(false);

	const cancelChange = () => {
		openModal = false;
		const currentAlgorithm = getConfiguredAlgorithm();
		configuredAlgorithm = currentAlgorithm === 'twatch' ? 'cdcl' : currentAlgorithm;
	};

	const acceptChange = (algorithmSelected: Algorithm) => {
		openModal = false;

		if (algorithmSelected === 'cdcl' && twatchToggled) {
			algorithmSelected = 'twatch';
		}

		if (algorithmSelected !== 'twatch') {
			twatchToggled = false;
		}

		setConfiguredAlgorithm(algorithmSelected);
		changeAlgorithmEventBus.emit(algorithmSelected);
	};

	const confirmUpdate = () => {
		if (getSolverMachine().onInitialState()) acceptChange(configuredAlgorithm);
		else openModal = true;
	};
</script>

<div class="heading-class">
	<DynamicRender component={CodePullRequestOutline} props={iconClass} />
	<span class="pt-1">Algorithm</span>
</div>
<div class="body-class">
	{configuredAlgorithm}

	<algorithm class={elementClass}>
		<selector class="flex items-center gap-4">
			<label for="algorithm">Algorithm:</label>
			<select
				id="algorithm"
				class="flex-1 cursor-pointer rounded-lg border-[var(--border-color)] text-right outline-none focus:outline-none focus:ring-0"
				onchange={confirmUpdate}
				bind:value={configuredAlgorithm}
			>
				{#each availableAlgorithms as algorithm}
					<option value={algorithm} selected={configuredAlgorithm === algorithm}>
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
					<div class="option">
						<label for="chb-watches">2-watched literals</label>
						<input
							type="checkbox"
							class="chb square"
							class:tick={twatchActivated}
							id="chb-watches"
							onchange={confirmUpdate}
							bind:checked={twatchToggled}
						/>
					</div>
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
		<button class="btn mr-4" onclick={() => acceptChange(configuredAlgorithm)}>Yes, I'm sure</button
		>
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
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
	}

	label + .chb {
		position: relative;
	}

	.chb {
		visibility: hidden;
		cursor: pointer;
		height: 100%;
		width: 20px;
	}

	.square::before {
		position: absolute;
		visibility: visible;
		/*   text-align: center; */

		border: 2px solid var(--icon-base);
		content: ' ';
		width: 16px;
		height: 16px;

		transition:
			all 0.1s ease-in,
			border-color 0.05s ease-in;
		top: calc(50% - 8px);
		left: calc(50% - 8px);
	}

	.tick::before {
		position: absolute;
		visibility: visible;
		transform: rotate(40deg);
		visibility: visible;
		border: 2px solid var(--icon-base);
		border-top-color: transparent;
		border-left-color: transparent;
		width: 8px;
		height: 14px;
		content: ' ';
		top: calc(50% - 8px);
		left: calc(50% - 4px);
	}

	.option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		display: flex;
		flex: 1;
		height: 2rem;
		position: relative;
	}
</style>
