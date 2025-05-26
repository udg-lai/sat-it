<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { logError } from '$lib/transversal/logging.ts';
	import { BugOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	let breakpointVariables: SvelteSet<number> = new SvelteSet<number>();
	let breakpointClauses: SvelteSet<number> = new SvelteSet<number>();

	let variableToAdd: number = $state(0);
	let clauseToAdd: number = $state(1);

	const probelm: Problem = $derived(getProblemStore());

	const addVariable = (): void => {
		if (probelm.variables.getVariablesIDs().includes(variableToAdd)) {
			breakpointVariables.add(variableToAdd);
		} else {
			logError('Breakpoint Variables', 'The variable you wanted to include is not in the problem');
		}
	};

	const addClause = (): void => {
		if (probelm.clauses.size() > clauseToAdd && probelm.clauses.size() < clauseToAdd) {
			breakpointClauses.add(clauseToAdd);
		} else {
			logError('Breakpoint Clauses', 'The clause you wanted to include is not in the problem');
		}
	};

	$effect(() => {
		breakpointVariables.forEach((variable) => {
			console.log(variable);
		})
	})
</script>

<div class={headingClass}>
	<DynamicRender component={BugOutline} props={iconClass} />
	<span class="pt-1">Breakpoints</span>
</div>
<div class={bodyClass}>
	<variables class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Variable:</label>
		<input
			id="baselineDelay"
			type="number"
			class="w-32 rounded-lg border border-gray-300 bg-white p-2 text-right focus:outline-none focus:ring-0"
			bind:value={variableToAdd}
			onchange={addVariable}
			min={0}
			max={probelm.algorithm.length}
		/>
	</variables>
	<variables-display class="{elementClass} h-80"> </variables-display>
	<clauses class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Variable:</label>
		<input
			id="baselineDelay"
			type="number"
			class="w-32 rounded-lg border border-gray-300 bg-white p-2 text-right focus:outline-none focus:ring-0"
			bind:value={clauseToAdd}
			onchange={addClause}
			min={0}
			max={probelm.algorithm.length}
		/>
	</clauses>
	<clauses-display class="{elementClass} h-80"> </clauses-display>
</div>
