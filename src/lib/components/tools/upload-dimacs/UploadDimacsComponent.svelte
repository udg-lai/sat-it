<script lang="ts">
	import { AccordionItem, Accordion } from 'flowbite-svelte';
	import { EyeOutline, TrashBinOutline, UploadOutline } from 'flowbite-svelte-icons';
	import { Toggle } from 'flowbite-svelte';
	import './styles.css';
	import { getContext, hasContext } from 'svelte';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import dimacsParser from '$lib/transversal/utils/parsers/dimacs.ts';
	import { logError, logWarning } from '$lib/transversal/utils/utils.ts';

	interface InteractivelyInstance extends DimacsInstance {
		removable: boolean;
		active: boolean;
	}

	let instances: InteractivelyInstance[] = $state([]);
	let fileInputRef: HTMLInputElement;

	fetchPreloadedInstances();

	function fetchPreloadedInstances(): void {
		const queryKey = 'preloadedInstances';
		if (!hasContext(queryKey)) {
			const title = 'Preloaded instances';
			const description = 'None preloaded instance found';
			logWarning(title, description);
		} else {
			const preloadInstances = getContext(queryKey) as DimacsInstance[];
			const initInteractive = {
				removable: false,
				active: false
			};
			instances = preloadInstances.map((e) => ({ ...e, ...initInteractive }));
			instances[0].active = true;
		}
	}

	function uploadFiles() {
		console.log(fileInputRef.files);

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
		const file = instances.find((p) => p.fileName === fileName);
		if (file) {
			const title = 'duplicated dimacs instance';
			const description = `Uploading file ${fileName} once again`;
			logWarning(title, description);
		} else {
			try {
				instances = [
					...instances,
					{
						fileName,
						content,
						active: false,
						removable: false,
						summary: dimacsParser(content)
					}
				];
			} catch (error) {
				const title = `Instance ${fileName} contains an error`;
				const description = (error as Error).message;
				logError(title, description);
			}
		}
	}

	function onToggleChange(index: number): void {
		const turnOn = false;
		instances = instances.map((e) => ({ ...e, ...{ active: turnOn } }));
		instances[index].active = true;
		setInstanceToCtx(instances[index]);
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
			{#each instances as item, i}
				<li>
					<div class="flex">
						<button class="icon">
							<TrashBinOutline />
						</button>
						<p class="mb-2 text-gray-500 dark:text-gray-400">{item.fileName}</p>
					</div>
					<div class="flex">
						<button class="icon">
							<EyeOutline />
						</button>
						<Toggle onchange={() => onToggleChange(i)} checked={item.active} class="toggle" />
					</div>
				</li>
			{/each}
		</ul>
	</AccordionItem>
</Accordion>
