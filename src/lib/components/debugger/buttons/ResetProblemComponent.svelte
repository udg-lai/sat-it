<script lang="ts">
	import { changeInstanceEventBus } from '$lib/events/events.ts';
	import { getActiveInstance } from '$lib/stores/instances.store.ts';
	import { Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline, RefreshOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../../DynamicRender.svelte';
	import '../style.css';

	const resetProps = {
		size: 'md'
	};

	let resetModal: boolean = $state(false);
</script>

<button
	class="btn general-btn"
	title="Reset"
	onclick={() => {
		resetModal = true;
	}}
>
	<DynamicRender component={RefreshOutline} props={resetProps} />

	<Modal bind:open={resetModal} size="xs" class="modal-style" dismissable={false}>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
			<h3 class="mb-5 text-lg font-normal text-gray-600">
				By resetting the problem, all the assignments made will be erased. Are you sure?
			</h3>
			<button
				class="btn btn-modal mr-4"
				onclick={() => {
					changeInstanceEventBus.emit(getActiveInstance()?.name as string);
					resetModal = false;
				}}>Yes, I'm sure</button
			>
			<button
				class="btn btn-modal"
				onclick={() => {
					resetModal = false;
				}}>No, cancel</button
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
	}
</style>
