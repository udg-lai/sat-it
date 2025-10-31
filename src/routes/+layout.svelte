<script lang="ts">
	import '../app.css';
	import '$lib/states/problem.svelte.ts';
	import {
		initializeInstances,
		setDefaultInstanceToSolve
	} from '$lib/bootstrap/bootstrap.svelte.ts';
	import { onMount } from 'svelte';

	let { children } = $props();
	let loadedBootstrap = $state(false);

	onMount(() => {
		initializeInstances()
			.then(() => {
				console.log('Hola');
				setDefaultInstanceToSolve();
				loadedBootstrap = true;
			})
			.catch(() => console.error('There was an error during the loading process'));
	});
</script>

{#if loadedBootstrap}
	{@render children()}
{:else}
	<!--HERE A LOADING PAGE SHOULD BE CREATED TODO-->
	<p>Loading instances...</p>
{/if}
