<script lang="ts">
	import { setContext } from 'svelte';
	import AppLayout from '$lib/AppLayout.svelte';

	const iconCtx = {
		size: 'xs'
	};
	setContext('iconCtx', iconCtx);

</script>

<AppLayout />