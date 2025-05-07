<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { addInstance } from '$lib/store/instances.store.ts';
	import { logError } from '$lib/transversal/logging.ts';
	import claims2html from '$lib/transversal/mapping/claimsToHtml.ts';
	import parser from '$lib/transversal/mapping/contentToSummary.ts';
	import { BottomNav, BottomNavItem, Tooltip } from 'flowbite-svelte';
	import {
		AdjustmentsVerticalOutline,
		ArrowDownToBracketOutline,
		BookOpenOutline,
		ExclamationCircleOutline,
		PlusOutline
	} from 'flowbite-svelte-icons';

	export type OptionEmit = 'bookmark' | 'engine' | 'info' | 'close';

	interface Props {
		event?: (emit: OptionEmit) => void;
	}

	let { event }: Props = $props();

	let inputRef: HTMLInputElement;

	function uploadFiles() {
		const files = inputRef.files || [];
		for (const file of files) {
			const reader = new FileReader();
			const name = file.name;
			reader.onload = (e: ProgressEvent<FileReader>) => {
				saveInstance(name, e.target?.result as string);
			};
			reader.onerror = () => {
				const title = `File ${name} could not be loaded`;
				logError(title, title);
			};
			reader.readAsText(file);
		}
	}

	function saveInstance(name: string, content: string): void {
		try {
			const summary = parser({ name: name, content });
			const instance: DimacsInstance = {
				name: name.toLowerCase(),
				content,
				summary,
				html: claims2html(summary.claims)
			};
			addInstance(instance);
		} catch (error) {
			const title = `Instance ${name} contains an error`;
			const description = (error as Error).message;
			logError(title, description);
		}
	}
</script>

<BottomNav position="absolute" navType="application" classInner="grid-cols-5">
	<BottomNavItem btnName="Hide" appBtnPosition="left" onclick={() => event?.('close')}>
		<ArrowDownToBracketOutline
			class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"
		/>
		<Tooltip arrow={false}>Hide</Tooltip>
	</BottomNavItem>

	<BottomNavItem btnName="Legend" appBtnPosition="middle" onclick={() => event?.('info')}>
		<ExclamationCircleOutline
			class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"
		/>
		<Tooltip arrow={false}>Legend</Tooltip>
	</BottomNavItem>

	<div class="flex items-center justify-center">
		<BottomNavItem
			btnName="Add instance"
			appBtnPosition="middle"
			btnClass="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary-600 rounded-full hover:bg-primary-700 group focus:ring-4 focus:ring-primary-300 focus:outline-hidden dark:focus:ring-primary-800"
			onclick={() => inputRef.click()}
		>
			<input
				type="file"
				hidden
				accept=".dimacs,.cnf,.txt"
				multiple
				bind:this={inputRef}
				onchange={uploadFiles}
			/>
			<PlusOutline class="text-white" />
			<Tooltip arrow={false}>Add instance</Tooltip>
		</BottomNavItem>
	</div>

	<BottomNavItem btnName="Instances" appBtnPosition="middle" onclick={() => event?.('bookmark')}>
		<BookOpenOutline
			class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"
		/>
		<Tooltip arrow={false}>Instances</Tooltip>
	</BottomNavItem>

	<BottomNavItem btnName="Engine" appBtnPosition="right" onclick={() => event?.('engine')}>
		<AdjustmentsVerticalOutline
			class="mb-1 h-6 w-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-500"
		/>
		<Tooltip arrow={false}>Engine</Tooltip>
	</BottomNavItem>
</BottomNav>
