<script lang="ts">
	import { AccordionItem, Accordion } from 'flowbite-svelte';
	import { EyeOutline, TrashBinOutline, UploadOutline } from 'flowbite-svelte-icons';
	import { Toggle } from 'flowbite-svelte';
	import './styles.css';

	let problems: string[] = ['problem 01', 'problem 02', 'problem 03'];

	let fileInputRef: HTMLInputElement;
	function openFileDialog() {
		fileInputRef.click();
	}
</script>

<Accordion flush>
	<AccordionItem open={true}>
		<span slot="header">Upload problem</span>
		<div class="container">
			<div class="file-input-box">
				<div class="wrapper-file-input flex flex-col">
					<button class="input-box" onclick={openFileDialog}>
						<UploadOutline size="xl" />
						<input type="file" hidden multiple bind:this={fileInputRef} />
					</button>
					<small>Files Supported: DIMACS</small>
				</div>
			</div>
		</div>
	</AccordionItem>
	<AccordionItem open={false}>
		<span slot="header">List of problems</span>
		<ul>
			{#each problems as problem}
				<li>
					<div class="flex">
						<button class="icon">
							<TrashBinOutline />
						</button>
						<p class="mb-2 text-gray-500 dark:text-gray-400">{problem}</p>
					</div>
					<div class="flex">
						<button class="icon">
							<EyeOutline />
						</button>
						<Toggle class="toggle" />
					</div>
				</li>
			{/each}
		</ul>
	</AccordionItem>
</Accordion>
