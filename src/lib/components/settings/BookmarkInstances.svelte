<script lang="ts">
	import {
		activateInstanceByName,
		deleteInstanceByName,
		getActiveInstance,
		instanceStore,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { DatabaseOutline, LockOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import ViewerComponent from './ViewerComponent.svelte';
	import { logInfo } from '$lib/transversal/logging.ts';

	let previewingInstance: InteractiveInstance | undefined = $state(undefined);

	onMount(() => {
		const unsubscribe = instanceStore.subscribe(() => (previewingInstance = getActiveInstance()));
		return () => {
			unsubscribe();
		};
	});

	function onActivateInstance(instanceName: string): void {
		const currentInstance = getActiveInstance();
		let change = false;
		if (currentInstance === undefined) {
			change = true;
		} else {
			const { name } = currentInstance;
			change = name !== instanceName;
		}
		if (change) {
			activateInstanceByName(instanceName);
			logInfo('New active instance', `Instance ${instanceName} has been activated`);
		}
	}
</script>

<div class="bookmark">
	<div class="bookmark-preview">
		{#if previewingInstance}
			<ViewerComponent dimacsInstance={previewingInstance} />
		{/if}
	</div>
	<div class="bookmark-list">
		{#if $instanceStore}
			<ul class="items scrollable">
				{#each $instanceStore as instance}
					<li>
						<button
							class="item"
							class:selected={instance.active}
							onmouseenter={() => (previewingInstance = instance)}
							onmouseleave={() => (previewingInstance = getActiveInstance())}
							onclick={() => onActivateInstance(instance.name)}
						>
							<p>{instance.name}</p>
						</button>

						<button
							class="icon"
							class:removable={instance.removable && !instance.active}
							class:invalid={!instance.removable || instance.active}
							disabled={!instance.removable || instance.active}
							onclick={() => deleteInstanceByName(instance.name)}
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
		background-color: rgba(239, 85, 47, 0.4);
	}

	.item.selected {
		color: rgba(239, 85, 47);
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
</style>
