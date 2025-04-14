<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import {
		activateInstanceByName,
		activeInstanceStore,
		addInstance,
		instanceStore,
		previewInstanceByName,
		removeInstanceByName,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import InstanceListComponent from './instance-list/InstanceListComponent.svelte';
	import DimacsUploaderComponent from './uploader/DimacsUploaderComponent.svelte';
	import DimacsViewerComponent from './viewer/DimacsViewerComponent.svelte';

	let listOpen = $state(true);
	let uploadOpen = $state(false);

	let instances: InteractiveInstance[] = $state([]);
	let viewingInstance: DimacsInstance | undefined = $state(undefined);

	let preview = $derived(
		instances.map((e) => {
			return {
				removable: e.removable,
				active: e.active,
				instanceName: e.instanceName,
				previewing: e.previewing
			};
		})
	);

	onMount(() => {
		const unsubscribeListOfInstances = instanceStore.subscribe((xs) => (instances = [...xs]));
		const unsubscribeActiveInstance = activeInstanceStore.subscribe(
			(instance) => (viewingInstance = instance)
		);
		return () => {
			unsubscribeListOfInstances();
			unsubscribeActiveInstance();
		};
	});

	function onActivateInstance(instanceName: string): void {
		activateInstanceByName(instanceName);
	}

	function onPreviewInstance(instanceName: string): void {
		previewInstanceByName(instanceName);
		setPreviewInstance(instanceName);
	}

	function setPreviewInstance(instanceName: string): void {
		viewingInstance = instances.find((e) => e.instanceName === instanceName);
	}
</script>

<div class="dimacs-viewer">
	{#if viewingInstance}
		<div class="dimacs-preview">
			<DimacsViewerComponent dimacsInstance={viewingInstance} />
		</div>
	{/if}

	<Accordion flush multiple={true} defaultClass="accordion">
		<AccordionItem bind:open={listOpen}>
			<span slot="header">List of instances</span>
			<InstanceListComponent
				{preview}
				onActivate={onActivateInstance}
				onPreview={onPreviewInstance}
				onRemove={removeInstanceByName}
			/>
		</AccordionItem>

		<AccordionItem bind:open={uploadOpen}>
			<span slot="header">Upload dimacs instance</span>
			<DimacsUploaderComponent onUpload={addInstance} />
		</AccordionItem>
	</Accordion>
</div>

<style>
	.dimacs-viewer {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	:global(.accordion) {
		display: flex;
		flex-direction: column;
	}

	.dimacs-preview {
		padding: 0;
		display: flex;
		flex: 1;
	}
</style>
