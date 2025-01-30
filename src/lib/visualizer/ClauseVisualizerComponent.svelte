<script lang="ts">
	import type Literal from '$lib/literal.svelte.ts';
	import LiteralComponent from '$lib/LiteralComponent.svelte';

	interface Props {
		clause: Literal[];
	}
	let { clause }: Props = $props();
</script>

<div class="flex flex-row">
	{#each clause as literal (literal.id)}
		<LiteralComponent {literal} />
	{/each}
</div>
