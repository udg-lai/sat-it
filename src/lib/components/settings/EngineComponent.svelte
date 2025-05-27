<script lang="ts">
	import AlgorithmComponent from './engine/AlgorithmComponent.svelte';
	import BreakingpointComponent from './engine/BreakingpointComponent.svelte';
	import ParametersComponent from './engine/PrametersComponent.svelte';

	const headingClass: string =
		'h-20 w-full flex items-center justify-center gap-2 text-md border-b';
	const iconClass = { size: 'xl' };
	const bodyClass: string = 'h-full w-full p-4 flex flex-col gap-3 overflow-hidden';
</script>

<div class="grid h-full w-full grid-cols-3 divide-x-4">
	<div class="flex flex-col overflow-hidden">
		<AlgorithmComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="flex flex-col overflow-hidden">
		<BreakingpointComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="flex flex-col overflow-hidden">
		<ParametersComponent {headingClass} {iconClass} {bodyClass} />
	</div>
</div>
