<script lang="ts">
	import { changeInstanceEventBus } from '$lib/events/events.ts';
	import { getActiveInstance } from '$lib/states/instances.svelte.ts';
	import { Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	let openModal: boolean = $state(false);
	let resetIcon = '/icons/Reset.svg';

	function resetProblem(): void {
		const instanceName: string = getActiveInstance().getInstanceName();
		changeInstanceEventBus.emit(instanceName);
		openModal = false;
	}

	function cancelReset(): void {
		openModal = false;
	}
</script>

<button
	class="btn general-btn"
	title="Reset"
	onclick={() => {
		openModal = true;
	}}
>
	<ImageRender icon={resetIcon} alt="Reset Problem icon" />
	<Modal bind:open={openModal} size="xs" class="modal-style" dismissable={false}>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
			<h3 class="mb-5 text-lg font-normal text-gray-600">
				By resetting the problem, the assignments will be erased. Are you sure?
			</h3>
			<button
				class="btn btn-modal mr-4"
				onclick={resetProblem}>Yes, I'm sure</button
			>
			<button
				class="btn btn-modal"
				onclick={cancelReset}>No, cancel</button
			>
		</div>
	</Modal>
</button>

<style>
	.btn-modal {
		border: solid;
		border-width: 1px;
		border-radius: 0.5rem;
		border-color: var(--border-color);
		padding: 0.75rem;
		cursor: pointer;
	}
</style>
