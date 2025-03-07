<script lang="ts">
	import './styles.css';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import LogicResolutionComponent from '$lib/components/LogicResolutionComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import { setContext } from 'svelte';
	import dummy from '$lib/dimacs/dummy.ts';
	import queens8 from '$lib/dimacs/queens/queens8.ts';
	import queens4 from '$lib/dimacs/queens/queens4.ts';
	import { toasts } from '$lib/store/toasts.store.ts';
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { logError } from '$lib/transversal/utils/utils.ts';

	function bootstrapInstances(): void {
		try {
			const instances: DimacsInstance[] = [dummy, queens4, queens8];
			setContext('preloadedInstances', instances);
		} catch (e) {
			const title = 'Pre-loaded dimacs instance contains an error';
			const description = (e as Error).message;
			logError(title, description);
		}
	}

	bootstrapInstances();
</script>

<app>
	{#if $toasts}
		<div class="toasts">
			{#each $toasts as toast (toast.id)}
				<ToastComponent {toast} />
			{/each}
		</div>
	{/if}

	<main>
		<div class="tools-section z-10">
			<ToolsComponent hide={true} />
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
