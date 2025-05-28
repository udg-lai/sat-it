<script lang="ts">
	import './_style.css';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		addBreakpoint,
		getBreakpoints,
		removeBreakpoint
	} from '$lib/store/breakpoints.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { logError } from '$lib/transversal/logging.ts';
	import { BugOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';

	interface Props {
		iconClass: { size: string };
	}

	let { iconClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let breakpointVariables: SvelteSet<number> = $derived(getBreakpoints());
	const showVariables: number[] = $derived(Array.from(breakpointVariables.values()));

	let variableToAdd: number | undefined = $state();

	const probelm: Problem = $derived(getProblemStore());

	const addVariable = (): void => {
		if (variableToAdd === undefined) return;
		if (!isNaN(variableToAdd) && probelm.variables.getVariablesIDs().includes(variableToAdd)) {
			addBreakpoint({ type: 'variable', variableId: variableToAdd });
		} else {
			logError('Breakpoint Variables', 'The variable you wanted to include is not in the problem');
		}
		variableToAdd = undefined;
	};

	$effect(() => {
		showVariables.forEach((variable) => {
			console.log(variable);
		});
	});
</script>

<div class="heading-class">
	<DynamicRender component={BugOutline} props={iconClass} />
	<span class="pt-1">Breakpoints</span>
</div>
<div class="body-class">
	<variables class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Variable:</label>
		<input
			id="baselineDelay"
			type="number"
			class="w-32 rounded-lg border border-[var(--border-color)] text-right focus:outline-none focus:ring-0"
			bind:value={variableToAdd}
			onchange={addVariable}
			min={0}
			max={probelm.variables.capacity}
		/>
	</variables>
	<variables-display class="breakpoint-display">
		<div class="{elementClass} scroll-container">
			<ul class="items scrollable">
				{#each showVariables as variable}
					<li>
						<button
							onclick={() => {
								removeBreakpoint({ type: 'variable', variableId: variable });
							}}
							class="w-full rounded-lg bg-white p-2 text-right hover:text-red-600"
						>
							{variable}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</variables-display>
</div>

<style>
	.breakpoint-display {
		height: 90%;
		width: 100%;
	}

	.scroll-container {
		height: 100%;
		width: 100%;
		overflow: auto;
		scrollbar-width: none;
	}

	.scroll-container::-webkit-scrollbar {
		display: none;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	li {
		display: flex;
		width: 100%;
	}
</style>
