<script lang="ts">
	import { AccordionItem, Accordion } from 'flowbite-svelte';
	import { EyeOutline, UploadOutline } from 'flowbite-svelte-icons';
	import './styles.css';

	function openFileInput(): void {
		console.log('Uploading file');
	}
	function handleFileChange(): void {}
</script>

<Accordion flush>
	<AccordionItem open={true}>
		<span slot="header">List of problems</span>
		<ul>
			<li>
				<p class="mb-2 text-gray-500 dark:text-gray-400">
          problema 1
				</p>
				<button class="icon">
					<EyeOutline />
				</button>
			</li>
			<li>
				<p class="mb-2 text-gray-500 dark:text-gray-400">
          problema 2
				</p>
				<button class="icon">
					<EyeOutline />
				</button>
			</li>
			<li>
				<p class="mb-2 text-gray-500 dark:text-gray-400">
          problema 3
				</p>
				<button class="icon">
					<EyeOutline />
				</button>
			</li>
		</ul>
	</AccordionItem>
	<AccordionItem>
		<span slot="header">Upload problem</span>
		<div class="container">
			<div class="file-input-box">
				<div class="wrapper-file-input flex flex-col">
					<button class="input-box" onclick={openFileInput}>
						<UploadOutline size="xl" />
						<input type="file" hidden onchange={handleFileChange} multiple />
					</button>
					<small>Files Supported: DIMACs</small>
				</div>
			</div>
		</div>
	</AccordionItem>
</Accordion>
