<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import FlexVirtualList from '$lib/components/FlexVirtualList.svelte';
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

	let breakpointVariables: SvelteSet<number> = $state(new SvelteSet<number>());
	let breakpointClauses: SvelteSet<number> = $state(new SvelteSet<number>());

	const showVariables: number[] = $derived(Array.from(breakpointVariables.values()));
	const showClauses: number[] = $derived(Array.from(breakpointClauses.values()));

	let variableToAdd: number | undefined = $state();
	let clauseToAdd: number | undefined = $state();

	const probelm: Problem = $derived(getProblemStore());

	const addVariable = (): void => {
		if (variableToAdd === undefined) return;
		if (!isNaN(variableToAdd) && probelm.variables.getVariablesIDs().includes(variableToAdd)) {
			breakpointVariables.add(variableToAdd);
			breakpointVariables = breakpointVariables;
		} else {
			logError('Breakpoint Variables', 'The variable you wanted to include is not in the problem');
		}
	};

	const addClause = (): void => {
		if (clauseToAdd === undefined) return;
		if (!isNaN(clauseToAdd) && clauseToAdd <= probelm.clauses.size() && 0 < clauseToAdd) {
			breakpointClauses.add(clauseToAdd);
			breakpointClauses = breakpointClauses;
		} else {
			logError('Breakpoint Clauses', 'The clause you wanted to include is not in the problem');
		}
	};

	$effect(() => {
		showVariables.forEach((variable) => {
			console.log(variable);
		});
	});
</script>

<div class={headingClass}>
	<DynamicRender component={BugOutline} props={iconClass} />
	<span class="pt-1">Breakpoints</span>
</div>
<div class="{bodyClass} flex flex-col">
	<div class="flex flex-1 flex-col gap-3">
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
		<variables-display class="{elementClass} flex flex-1 flex-col">
			<FlexVirtualList items={showVariables} itemSize={25}>
				<div slot="item" let:item class="h-max text-right">
					<button
						onclick={() => {
							breakpointVariables.delete(item as number);
							breakpointVariables = breakpointVariables;
						}}
						class="w-full rounded-lg bg-white p-2 text-right hover:text-red-300"
					>
						{item}
					</button>
				</div>
			</FlexVirtualList>
		</variables-display>
	</div>
	<div class="flex flex-1 flex-col gap-3">
		<clauses class="{elementClass} flex items-center justify-between">
			<label for="baselineDelay" class="whitespace-nowrap">Clause:</label>
			<input
				id="baselineDelay"
				type="number"
				class="w-32 rounded-lg border border-[var(--border-color)] text-right focus:outline-none focus:ring-0"
				bind:value={clauseToAdd}
				onchange={addClause}
				min={1}
				max={probelm.clauses.size()}
			/>
		</clauses>
		<clauses-display class="{elementClass} flex flex-1 flex-col">
			<FlexVirtualList items={showClauses} itemSize={25}>
				<div slot="item" let:item class="h-max">
					<button
						onclick={() => {
							breakpointClauses.delete(item as number);
							breakpointClauses = breakpointClauses;
						}}
						class="w-full rounded-lg bg-white p-2 text-right hover:text-red-300"
					>
						{item}
					</button>
				</div>
			</FlexVirtualList>
		</clauses-display>
	</div>
</div>
