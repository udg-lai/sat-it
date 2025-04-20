<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logError } from '$lib/transversal/utils/logging.ts';
	import parser from '$lib/transversal/utils/parsers/dimacs.ts';
	import { UploadOutline } from 'flowbite-svelte-icons';
	import './styles.css';

	interface Props {
		onUpload?: (instance: DimacsInstance) => void;
	}

	let { onUpload }: Props = $props();

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
			const summary = parser({ name: instanceName, content });
			const instance: DimacsInstance = {
				instanceName,
				content,
				summary
			};
			onUpload?.(instance);
		} catch (error) {
			const title = `Instance ${instanceName} contains an error`;
			const description = (error as Error).message;
			logError(title, description);
		}
	}
</script>

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
