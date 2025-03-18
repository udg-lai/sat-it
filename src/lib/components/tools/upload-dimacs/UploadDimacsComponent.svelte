<script lang="ts">
	import { AccordionItem, Accordion } from 'flowbite-svelte';
	import {
		DatabaseOutline,
		EyeOutline,
		LockOutline,
		TrashBinOutline,
		UploadOutline
	} from 'flowbite-svelte-icons';
	import { Toggle } from 'flowbite-svelte';
	import './styles.css';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import dimacsParser from '$lib/transversal/utils/parsers/dimacs.ts';
	import { logError } from '$lib/transversal/utils/logging.ts';
	import { activateInstance, addInstance, instances } from '$lib/store/instances.store.ts';

	let fileInputRef: HTMLInputElement;

	function uploadFiles() {
		const files = fileInputRef.files || [];
		for (const file of files) {
			const reader = new FileReader();
			const instanceName = file.name;
			reader.onload = (e: ProgressEvent<FileReader>) => {
				saveInstance(instanceName, e.target?.result as string);
			};
			reader.onerror = () => {
				const title = `File ${instanceName} could not be loaded`;
				logError(title, title);
			};
			reader.readAsText(file);
		}
	}

	function saveInstance(instanceName: string, content: string): void {
		try {
			const summary = dimacsParser(content);
			const instance: DimacsInstance = {
				instanceName,
				content,
				summary
			};
			addInstance(instance);
		} catch (error) {
			const title = `Instance ${instanceName} contains an error`;
			const description = (error as Error).message;
			logError(title, description);
		}
	}
</script>

<Accordion flush>
	<AccordionItem open={false}>
		<span slot="header">Upload problem</span>
		<div class="container">
			<div class="file-input-box">
				<div class="wrapper-file-input flex flex-col">
					<button class="input-box" onclick={() => fileInputRef.click()}>
						<UploadOutline size="xl" />
						<input
							type="file"
							hidden
							accept=".dimacs,.cnf,.txt"
							multiple
							bind:this={fileInputRef}
							onchange={uploadFiles}
						/>
					</button>
					<small>Files Supported: .dimacs & .cnf & .txt</small>
				</div>
			</div>
		</div>
	</AccordionItem>
	<AccordionItem open={true}>
		<span slot="header">List of problems</span>
		<ul>
			{#each $instances as instance}
				<li>
					<div class="flex">
						<button class="icon not-removable" disabled={!instance.removable || instance.active}>
							{#if instance.removable && !instance.active}
								<TrashBinOutline />
							{:else if instance.removable && instance.active}
								<LockOutline />
							{:else}
								<DatabaseOutline />
							{/if}
						</button>
						<p class="mb-2 text-gray-500 dark:text-gray-400">{instance.instanceName}</p>
					</div>
					<div class="flex">
						<button class="icon">
							<EyeOutline />
						</button>
						<Toggle
							onchange={() => activateInstance(instance)}
							checked={instance.active}
							disabled={instance.active}
							class="toggle"
						/>
					</div>
				</li>
			{/each}
		</ul>
	</AccordionItem>
</Accordion>
