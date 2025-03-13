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
	import { logError, logInfo, logWarning } from '$lib/transversal/utils/logging.ts';
	import { instances, type Instance } from '$lib/store/instances.store.ts';
	import { get } from 'svelte/store';

	interface InteractivelyInstance extends DimacsInstance {
		removable: boolean;
		active: boolean;
	}

	let localInstances: Instance[] = $state([...get(instances)])

	let fileInputRef: HTMLInputElement;

	function uploadFiles() {
		const files = fileInputRef.files || [];
		for (const file of files) {
			const reader = new FileReader();
			const fileName = file.name;
			reader.onload = (e: ProgressEvent<FileReader>) => {
				processFile(fileName, e.target?.result as string);
			};
			reader.onerror = () => {
				const title = `File ${fileName} could not be loaded`;
				logError(title, title);
			};
			reader.readAsText(file);
		}
	}

	function processFile(fileName: string, content: string): void {
		const file = localInstances.find((p) => p.fileName === fileName);
		if (file) {
			const title = 'Duplicated instance';
			const description = `File ${fileName} already uplaoded`;
			logWarning(title, description);
		} else {
			try {
				const summary = dimacsParser(content);
				localInstances = [
					...localInstances,
					{
						fileName,
						content,
						summary,
						active: false,
						removable: true
					}
				];
				const title = `File uploaded`;
				const description = `File ${fileName} parsed and ready to use`;
				logInfo(title, description);
			} catch (error) {
				const title = `Instance ${fileName} contains an error`;
				const description = (error as Error).message;
				logError(title, description);
			}
		}
	}

	function onToggleChange(index: number): void {
		localInstances = localInstances.map((e) => ({ ...e, ...{ active: false } }));
		localInstances[index].active = true;
		setInstanceToCtx(localInstances[index]);
	}

	function setInstanceToCtx(instance: InteractivelyInstance) {
		console.log('updating problem', instance);
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
			{#each localInstances as item, i}
				<li>
					<div class="flex">
						<button class="icon not-removable" disabled={!item.removable || item.active}>
							{#if item.removable && !item.active}
								<TrashBinOutline />
							{:else if item.removable && item.active}
								<LockOutline />
							{:else}
								<DatabaseOutline />
							{/if}
						</button>
						<p class="mb-2 text-gray-500 dark:text-gray-400">{item.fileName}</p>
					</div>
					<div class="flex">
						<button class="icon">
							<EyeOutline />
						</button>
						<Toggle
							onchange={() => onToggleChange(i)}
							checked={item.active}
							disabled={item.active}
							class="toggle"
						/>
					</div>
				</li>
			{/each}
		</ul>
	</AccordionItem>
</Accordion>
