<script lang="ts">
	import { activateInstance, activeInstanceStore, addInstance, instanceStore, type InteractiveInstance } from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import InstanceListComponent from './instance-list/InstanceListComponent.svelte';
	import DimacsUploaderComponent from './uploader/DimacsUploaderComponent.svelte';
	import DimacsViewerComponent from './viewer/DimacsViewerComponent.svelte';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	let uploaderOpen = $state(false);
	let listOpen = $state(false);
	let previewOpen = $derived(!uploaderOpen && !listOpen);
	let instances: InteractiveInstance[] = $state([])



</script>

<Accordion flush>
	<AccordionItem bind:open={uploaderOpen}>
		<span slot="header">Upload dimacs instance</span>
		<DimacsUploaderComponent onInstanceLoaded={(e) => addAndCloseUploader(e)} />
	</AccordionItem>
	<AccordionItem bind:open={listOpen}>
		<span slot="header">List of instances</span>
		<InstanceListComponent onActivate={onActivate} bind:instances={instances} />
	</AccordionItem>
	<AccordionItem open={previewOpen}>
		<span slot="header">
			Preview current instance: {$activeInstanceStore ? $activeInstanceStore.instanceName : ''}
		</span>
		{#if $activeInstanceStore}
			<DimacsViewerComponent dimacs={$activeInstanceStore} />
		{/if}
	</AccordionItem>
</Accordion>
