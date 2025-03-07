<script lang="ts">
	import { AccordionItem, Accordion } from 'flowbite-svelte';
	import { EyeOutline, TrashBinOutline, UploadOutline } from 'flowbite-svelte-icons';
	import { Toggle } from 'flowbite-svelte';
	import './styles.css';
	import type { InstanceDimacs } from '$lib/instances/InstanceDimacs.ts';
	import { getContext, hasContext } from 'svelte';
	import type { Summary } from '$lib/transversal/utils/dimacs.ts';
	import {
		isNothing,
		makeJust,
		makeNothing,
		type Maybe
	} from '$lib/transversal/utils/types/maybe.ts';
	import parser from '$lib/transversal/utils/dimacs.ts';

	interface InteractivelyInstance extends InstanceDimacs {
		removable: boolean;
		active: boolean;
		summary: Maybe<Summary>;
	}

	let instances: InteractivelyInstance[] = $state([]);
	let fileInputRef: HTMLInputElement;

	fetchPreloadedInstances();

	function fetchPreloadedInstances(): void {
		const queryKey = 'preloadedInstances';
		if (!hasContext(queryKey)) {
			console.error(`should be problems already loaded`);
		} else {
			const preloadInstances = getContext(queryKey) as InstanceDimacs[];
			const initInteractive = {
				removable: false,
				active: false,
				summary: makeNothing()
			};
			instances = preloadInstances.map((e) => ({ ...e, ...initInteractive }));
			instances[0].active = true;
			instances[0].summary = makeJust(parser(instances[0].content));
		}
	}

	function uploadFiles() {
		console.log(fileInputRef.files);

		const files = fileInputRef.files || [];

		for (const file of files) {
			const reader = new FileReader();

			reader.onload = (e: ProgressEvent<FileReader>) => {
				console.log(`Content of ${file.name}:`, e.target?.result);
			};

			reader.onerror = (e) => {
				console.error(`Error reading ${file.name}:`, e.target?.error);
			};

			reader.readAsText(file);
		}
	}

	function saveFile(problem: string, content: string): void {
		const file = instances.find((p) => p.fileName === problem);
		if (file) {
			console.error(`Uploading file ${problem} once again`);
		} else {
			instances = [
				...instances,
				{
					fileName: problem,
					content,
					active: false,
					removable: false,
					summary: makeNothing()
				}
			];
		}
	}

	function onToggleChange(index: number): void {
		const turnOn = false;
		instances = instances.map((e) => ({ ...e, ...{ active: turnOn } }));
		instances[index].active = true;
		if (isNothing(instances[index].summary)) {
			instances[index].summary = makeJust(parser(instances[index].content));
		}
		console.log($state.snapshot(instances[index]));
	}
</script>

<Accordion flush>
	<AccordionItem open={true}>
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
	<AccordionItem open={false}>
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
