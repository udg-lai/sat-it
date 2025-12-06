<script lang="ts">
	import type { InteractiveInstance } from '$lib/entities/InteractiveInstance.svelte.ts';
	import {
		activateInstanceByName,
		deleteInstanceByName,
		getActiveInstance,
		getInstances,
		getInteractiveInstance
	} from '$lib/states/instances.svelte.ts';
	import { logInfo } from '$lib/states/toasts.svelte.ts';
	import { Modal } from 'flowbite-svelte';
	import {
		DatabaseOutline,
		ExclamationCircleOutline,
		LockOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import ProblemSummaryComponent from './ProblemSummaryComponent.svelte';

	let activeInstance: InteractiveInstance = $derived(getActiveInstance());
	let previewingInstance: InteractiveInstance = $state(getActiveInstance());
	let instanceSelected: string = $state('');
	let openModal: boolean = $state(false);
	let activeInstanceName: string = $derived.by(() => {
		if (activeInstance === undefined) return '';
		else return activeInstance.getInstanceName();
	});

	const instances: InteractiveInstance[] = $derived(getInstances());

	function instanceClicked(instanceName: string) {
		if (activeInstanceName === instanceName) return;
		openModal = true;
		instanceSelected = instanceName;
		previewingInstance = getInteractiveInstance(instanceName);
	}

	function onAcceptUpdateInstance(instanceName: string): void {
		activateInstanceByName(instanceName);
		logInfo('New active instance', `Instance ${instanceName} has been activated`);
		openModal = false;
		previewingInstance = getActiveInstance();
	}

	function onCancelUpdateInstance(): void {
		openModal = false;
		previewingInstance = getActiveInstance();
	}

	function decidingToChange(): boolean {
		return openModal;
	}

	function onMouseLeaveAnInstance(): void {
		if (!decidingToChange()) {
			previewingInstance = getActiveInstance();
		}
	}
</script>

<div class="bookmark">
	<div class="bookmark-preview">
		{#if previewingInstance}
			<ProblemSummaryComponent instance={previewingInstance.getInstance()} />
		{/if}
	</div>
	<div class="bookmark-list">
		{#if instances}
			<ul class="items scrollable">
				{#each instances as instance}
					<li>
						<button
							class="item"
							class:selected={instance.active}
							onmouseenter={() => (previewingInstance = instance)}
							onmouseleave={onMouseLeaveAnInstance}
							onclick={() => instanceClicked(instance.getInstanceName())}
						>
							<p>{instance.getInstanceName()}</p>
						</button>

						<button
							class="icon"
							class:removable={instance.removable && !instance.active}
							class:invalid={!instance.removable || instance.active}
							disabled={!instance.removable || instance.active}
							onclick={() => deleteInstanceByName(instance.getInstanceName())}
						>
							{#if instance.removable && !instance.active}
								<TrashBinOutline />
							{:else if instance.removable && instance.active}
								<LockOutline />
							{:else}
								<DatabaseOutline />
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Modal bind:open={openModal} size="xs" class="modal-style" dismissable={false}>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-red-600" />
		<h3 class="mb-5 text-lg font-normal text-gray-600">
			All the assignments made will be erased. Are you sure?
		</h3>
		<button
			class="btn btn-modal mr-4"
			onclick={() => {
				onAcceptUpdateInstance(instanceSelected);
			}}
		>
			<span>Yes, change</span>
		</button>
		<button class="btn" onclick={onCancelUpdateInstance}>
			<span>No, cancel</span>
		</button>
	</div>
</Modal>

<style>
	.bookmark {
		height: 100%;
		width: 100%;
		display: flex;
	}

	.bookmark-list {
		width: 60%;
		display: flex;
		align-items: center;
	}

	.bookmark-preview {
		padding: 2rem 2rem;
		flex: 1;
		display: flex;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		width: 100%;
	}

	.scrollable {
		height: 80%;
		overflow: auto;
		scrollbar-width: none;
	}

	.scrollable::-webkit-scrollbar {
		display: none;
	}

	.item {
		display: flex;
		align-items: center;
		display: flex;
		position: relative;
		padding: 2rem;
		flex: 1;
		transition:
			color 0.2s,
			background-color 0.2s;
	}

	li {
		display: flex;
		width: 100%;
	}

	.icon {
		padding: 2rem;
	}

	.removable:hover {
		color: rgb(239 86 47 / var(--tw-text-opacity, 1));
	}

	.icon.invalid {
		cursor: not-allowed;
	}

	.item:hover {
		background-color: var(--lighter-bg-color);
	}

	.item.selected {
		color: var(--icon-base);
	}

	.item p {
		margin: 0;
		margin-top: 0.4rem;
	}

	:global(.toggle) {
		padding-left: 5px;
		--tw-grayscale: 0%;
		--tw-contrast: 1;
	}

	:global(.modal-style) {
		background-color: var(--main-bg-color);
		color: black;
		z-index: var(--modal-z-index);
	}

	.btn {
		border: solid;
		border-width: 1px;
		border-radius: 0.5rem;
		border-color: var(--border-color);
		padding: 0.75rem;
	}
</style>
