<script lang="ts">
	import { activeInstanceStore, addInstance, instanceStore } from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import InstanceListComponent from './instance-list/InstanceListComponent.svelte';
	import DimacsUploaderComponent from './uploader/DimacsUploaderComponent.svelte';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import DimacsViewerComponent from './viewer/DimacsViewerComponent.svelte';

	let uploaderOpen = $state(false);
	let listOpen = $state(false);
	let previewOpen = $derived(!uploaderOpen && !listOpen);

	function addAndCloseUploader(e: DimacsInstance) {
		addInstance(e);
		uploaderOpen = false;
	}
</script>

<Accordion flush>
	<AccordionItem bind:open={uploaderOpen}>
		<span slot="header">Upload dimacs instance</span>
		<DimacsUploaderComponent onInstanceLoaded={(e) => addAndCloseUploader(e)} />
	</AccordionItem>
	<AccordionItem bind:open={listOpen}>
		<span slot="header">List of instances</span>
		<InstanceListComponent instances={$instanceStore} />
	</AccordionItem>
	<AccordionItem open={previewOpen}>
		<span slot="header">Active instance preview</span>
		{#if $activeInstanceStore}
			<DimacsViewerComponent dimacs={$activeInstanceStore} />
		{/if}
	</AccordionItem>
</Accordion>
