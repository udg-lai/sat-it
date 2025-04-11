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

	let previewerRef: HTMLElement | undefined = $state(undefined);
	let previewObserver: ResizeObserver;
	let dimacsViewerHeight: number = $state(0);

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

	function updateHeight(htmlElement: HTMLElement) {
		if (previewObserver) previewObserver.disconnect();

		previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				dimacsViewerHeight = entry.contentRect.height - 25;
			}
			console.log(dimacsViewerHeight);
		});
		previewObserver.observe(htmlElement);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}
</script>

<div class="dimacs-viewer">
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
	</Accordion>

	{#if currentActiveInstance}
		<div class="dimacs-preview" bind:this={previewerRef} use:updateHeight>
			<DimacsViewerComponent dimacsInstance={currentActiveInstance} height={dimacsViewerHeight} />
		</div>
	{/if}
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
		padding: 1.25rem 0rem;
		display: flex;
		flex: 1;
	}
</style>
