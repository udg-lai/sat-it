<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { resetProblemEventBus } from '$lib/events/events.ts';
	import { Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import { asset } from '$app/paths';

	let modalOpened: boolean = $state(false);
	let resetIcon = asset('/icons/Reset.svg');

	function resetProblem(): void {
		resetProblemEventBus.emit();
		modalOpened = false;
	}

	function cancelReset(): void {
		modalOpened = false;
	}

	function openModal(): void {
		modalOpened = true;
	}
</script>

<button class="btn general-btn" title="Reset" onclick={openModal}>
	<ImageRender icon={resetIcon} alt="Reset Problem icon" />
	<Modal bind:open={modalOpened} size="xs" class="modal-style" dismissable={false}>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
			<h3 class="mb-5 text-lg font-normal text-gray-600">
				By resetting the problem, the assignments will be erased. Are you sure?
			</h3>
			<button class="btn btn-modal mr-4" onclick={resetProblem}>Yes, I'm sure</button>
			<button class="btn btn-modal" onclick={cancelReset}>No, cancel</button>
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
