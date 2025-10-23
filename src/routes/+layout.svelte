<script lang="ts">
	import { initializeInstances, setDefaultInstanceToSolve } from '$lib/bootstrap/bootstrap.svelte.ts';
	import { logError } from '$lib/stores/toasts.svelte.ts';
	import '../app.css';

	let { children } = $props();

	let loadedBootstrap: boolean = $state(false)
	initializeInstances()
		.then(() => {
			setDefaultInstanceToSolve();
			loadedBootstrap = true;
		})
		.catch(() =>
			logError(`Preloaded instances`, `Could not fetch preloaded instances correctly`)
		);
</script>

{#if loadedBootstrap}
	{@render children()}
{/if}