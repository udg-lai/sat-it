<script lang="ts">
	import {
		activateInstanceByName,
		activeInstanceStore,
		addInstance,
		instanceStore,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import InstanceListComponent from './instance-list/InstanceListComponent.svelte';
	import DimacsUploaderComponent from './uploader/DimacsUploaderComponent.svelte';
	import DimacsViewerComponent from './viewer/DimacsViewerComponent.svelte';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { onMount } from 'svelte';

	let listOpen = $state(true);
	let instancePreviewOpen = $state(true);
	let uploadOpen = $state(false);

	let instances: InteractiveInstance[] = $state([]);
	let currentActiveInstance: DimacsInstance | undefined = $state(undefined);

	let preview = $derived(
		instances.map((e) => {
			return {
				removable: e.removable,
				active: e.active,
				instanceName: e.instanceName
			};
		})
	);

	onMount(() => {
		const unsubscribeListOfInstances = instanceStore.subscribe((xs) => (instances = [...xs]));
		const unsubscribeActiveInstance = activeInstanceStore.subscribe(
			(instance) => (currentActiveInstance = instance)
		);
		return () => {
			unsubscribeListOfInstances();
			unsubscribeActiveInstance();
		};
	});

	function onActivateInstance(instanceName: string): void {
		activateInstanceByName(instanceName);
	}

	function setPreviewInstance(instanceName: string): void {
		currentActiveInstance = instances.find((e) => e.instanceName === instanceName);
		instancePreviewOpen = true;
	}
</script>

<Accordion flush multiple={true} defaultClass="accordion">
	<AccordionItem bind:open={uploadOpen}>
		<span slot="header">Upload dimacs instance</span>

		<DimacsUploaderComponent onUpload={addInstance} />
	</AccordionItem>

	<AccordionItem bind:open={listOpen}>
		<span slot="header">List of instances</span>
		<InstanceListComponent
			{preview}
			onActivate={onActivateInstance}
			onPreview={setPreviewInstance}
		/>
	</AccordionItem>

	<AccordionItem bind:open={instancePreviewOpen}>
		<span slot="header">
			Instance previewer - {currentActiveInstance ? currentActiveInstance.instanceName : ''}
		</span>
		{#if currentActiveInstance}
			<DimacsViewerComponent dimacsInstance={currentActiveInstance} />
		{/if}
	</AccordionItem>
</Accordion>

<style>
	:global(.accordion) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	:global(.accordion > div:last-child) {
		display: flex;
		flex: 1;
		overflow-y: auto;
		position: relative;
	}

	:global(.accordion > div:last-child > div) {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
