<script lang="ts">
	export let component;
	export let props = {};
</script>

{#if component}
	<svelte:component this={component} {...props} />
{/if}
