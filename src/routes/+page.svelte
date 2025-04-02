<script lang="ts">
	import './styles.css';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { disableContextMenu, fromClaimsToClause } from '$lib/transversal/utils/utils.ts';
	import { toasts } from '$lib/store/toasts.store.ts';
	import {
		instanceStore,
		initializeInstancesStore,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { logError } from '$lib/transversal/utils/logging.ts';
	import VariablePool from '$lib/transversal/entities/VariablePool.ts';
	import { updateProblem } from '$lib/store/problem.store.ts';
	import { onMount } from 'svelte';
	import AppComponent from '$lib/components/AppComponent.svelte';
	import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';

	onMount(() => {
		initializeInstancesStore()
			.then(setDefaultInstanceToSolve)
			.catch(() =>
				logError(`Preloaded instances`, `Could not fetch preloaded instances correctly`)
			);
	});

	function setDefaultInstanceToSolve() {
		// pre: only executed if there are problems to set as default
		const instances: InteractiveInstance[] = $instanceStore;
		if (instances.length > 0) {
			const { summary } = instances[0];
			const { claims } = summary;

			const variables: VariablePool = new VariablePool(summary.varCount);
			const clauses: ClausePool = new ClausePool(fromClaimsToClause(claims.simplified, variables));

			const pools = {
				variables,
				clauses
			};

			const algorithm = () => console.log('new algorithm');

			const problem = { pools, algorithm };

			updateProblem(problem);
		}
	}
</script>

<svelte:body oncontextmenu={disableContextMenu} />

<app class="chakra-petch-medium">
	{#if $toasts}
		<div class="toasts">
			{#each $toasts as toast (toast.id)}
				<ToastComponent {toast} />
			{/each}
		</div>
	{/if}

	<main>
		<div class="tools-section z-10">
			<ToolsComponent />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={app} />
			</play-area>
		</workspace>
	</main>
	<footer>
		<FooterComponent />
	</footer>
</app>

{#snippet app()}
	<AppComponent />
{/snippet}
