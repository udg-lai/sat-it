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
	const showVariables: number[] = $derived(
		Array.from(breakpointVariables.values()).sort((a, b) => a - b)
	);

	let variableToAdd: number | undefined = $state();

	const problem: Problem = $derived(getProblemStore());

	const addVariable = (): void => {
		if (variableToAdd === undefined) return;
		if (!isNaN(variableToAdd) && problem.variables.getVariablesIDs().includes(variableToAdd)) {
			addBreakpoint({ type: 'variable', variableId: variableToAdd });
		} else {
			logError('Breakpoint Variables', 'The variable you wanted to include is not in the problem');
		}
		variableToAdd = undefined;
	};

	const validateInput = (event: Event): void => {
		const input: HTMLInputElement = event.target as HTMLInputElement;
		const value: number = Number(input.value);

		if (isNaN(value)) {
			variableToAdd = undefined;
			input.value = '';
			return;
		}

		const min: number = 1;
		const max: number = problem.variables.capacity;

		if (value < min || value > max) {
			variableToAdd = undefined;
			input.setCustomValidity(`Value must be between ${min} and ${max}`);
			input.reportValidity();
			return;
		} else {
			input.setCustomValidity('');
		}

		variableToAdd = value;
	};
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
			oninput={validateInput}
			min={1}
			max={problem.variables.capacity}
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
							class="variable-text"
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

	.variable-text {
		width: 100%;
		border-radius: 10px;
		background-color: white;
		border: solid;
		border-width: 1px;
		border-color: var(--border-color);
		padding: 0.5rem;
		transition:
			color 300ms,
			background-color 300ms,
			border-color 300ms;
	}
	.variable-text:hover {
		background-color: rgb(255, 185, 185);
		color: rgb(202, 53, 53);
		border-color: rgb(245, 42, 42);
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
