<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getBaselineDelay, MIN_DELAY, setBaselineDelay } from '$lib/store/parameters.svelte.ts';
	import { logError } from '$lib/transversal/logging.ts';
	import { CogOutline } from 'flowbite-svelte-icons';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let baselineDelay: number = $state(getBaselineDelay());

	function updateBaselineDelay(newValue: number) {
		if (!isNaN(newValue) && newValue >= MIN_DELAY) {
			setBaselineDelay(newValue);
		} else {
			logError('Delay error', 'The entered delay is not acceptable');
			baselineDelay = getBaselineDelay();
		}
	}
</script>

<div class={headingClass}>
	<DynamicRender component={CogOutline} props={iconClass} />
	<span class="pt-1">General Settings</span>
</div>
<div class={bodyClass}>
	<div class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Delay:</label>
		<input
			id="baselineDelay"
			type="number"
			class="w-32 rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-0"
			bind:value={baselineDelay}
			onchange={() => updateBaselineDelay(baselineDelay)}
		/>
	</div>
</div>
