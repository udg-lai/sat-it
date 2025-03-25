<script lang="ts">
	import './styles.css';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import LogicResolutionComponent from '$lib/components/LogicResolutionComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { disableContextMenu } from '$lib/transversal/utils/utils.ts';
	import { toasts } from '$lib/store/toasts.store.ts';
	import {
		instanceStore,
		initializeInstancesStore,
		type InteractiveInstance
	} from '$lib/store/instances.store.ts';
	import { logError } from '$lib/transversal/utils/logging.ts';
	import VariablePool from '$lib/transversal/entities/VariablePool.ts';
	import { updateProblem } from '$lib/problem.svelte.ts';
	import { onMount } from 'svelte';

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

			const pools = {
				variables: new VariablePool(summary.varCount),
				clauses: new VariablePool(summary.varCount)
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
			<ToolsComponent closed={true} />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={logicResolution} />
			</play-area>
		</workspace>
	</main>
	<footer>
		<FooterComponent />
	</footer>
</app>

{#snippet logicResolution()}
	<LogicResolutionComponent />
{/snippet}
