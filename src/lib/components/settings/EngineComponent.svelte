<script lang="ts">
	import AlgorithmSettingsComponent from './engine/AlgorithmSettingsComponent.svelte';
	import DebuggingSettingsComponent from './engine/DebuggingSettingsComponent.svelte';
	import GeneralSettingsComponent from './engine/GeneralSettingsComponent.svelte';

	const headingClass: string =
		'h-20 w-full flex items-center justify-center gap-2 text-lg border-b';
	const iconClass = { size: 'xl' };
	const bodyClass: string = 'h-full w-full p-4';
</script>

<div class="grid h-full w-full grid-cols-3 divide-x-4">
	<div class="flex flex-col">
		<AlgorithmSettingsComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="flex flex-col">
		<DebuggingSettingsComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="flex flex-col">
		<GeneralSettingsComponent {headingClass} {iconClass} {bodyClass} />
	</div>
</div>
