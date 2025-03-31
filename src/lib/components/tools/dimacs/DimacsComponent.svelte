<script lang="ts">
	import {
		addInstance,
		instanceStore,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import InstanceListComponent from './instance-list/InstanceListComponent.svelte';
	import DimacsUploaderComponent from './uploader/DimacsUploaderComponent.svelte';
	import { onMount } from 'svelte';

	let uploaderOpen = $state(false);
	let listOpen = $derived(!uploaderOpen);

	let instances: InteractiveInstance[] = $state([]);

	function addAndCloseUploader(e: InteractiveInstance) {
		addInstance(e);
		uploaderOpen = false;
	}

	onMount(() => {
		const unsubscription = instanceStore.subscribe((e) => (instances = [...e]));
		return () => {
			unsubscription();
		};
	});
</script>

<Accordion flush>
	<AccordionItem bind:open={uploaderOpen}>
		<span slot="header">Upload dimacs instance</span>
		<DimacsUploaderComponent onInstanceLoaded={(e) => addAndCloseUploader(e)} />
	</AccordionItem>
	<AccordionItem open={listOpen}>
		<span slot="header">List of instances</span>
		<InstanceListComponent {instances} />
	</AccordionItem>
</Accordion>

<!--
<DimacsViewerComponent />
-->
