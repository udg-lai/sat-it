<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import {
		activateInstanceByName,
		previewingInstanceStore,
		addInstance,
		instanceStore,
		previewInstanceByName,
		removeInstanceByName,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import InstanceListComponent from './ListComponent.svelte';
	import DimacsUploaderComponent from '../tools/UploaderComponent.svelte';
	import DimacsViewerComponent from './ViewerComponent.svelte';

	let listOpen = $state(true);
	let uploadOpen = $state(false);

	let instances: InteractiveInstance[] = $state([]);
	let viewingInstance: DimacsInstance | undefined = $state(undefined);

	let preview = $derived(
		instances.map((e) => {
			return {
				removable: e.removable,
				active: e.active,
				name: e.name,
				previewing: e.previewing
			};
		})
	);

	onMount(() => {
		const unsubscribeListOfInstances = instanceStore.subscribe((xs) => (instances = [...xs]));
		const unsubscribeActiveInstance = previewingInstanceStore.subscribe(
			(instance) => (viewingInstance = instance)
		);
		return () => {
			unsubscribeListOfInstances();
			unsubscribeActiveInstance();
		};
	});

	function onActivateInstance(name: string): void {
		activateInstanceByName(name);
	}

	function onPreviewInstance(name: string): void {
		previewInstanceByName(name);
		setPreviewInstance(name);
	}

	function setPreviewInstance(name: string): void {
		viewingInstance = instances.find((e) => e.name === name);
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
