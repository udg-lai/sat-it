<script lang="ts">
	import type { Clause } from '$lib/cnf.svelte.ts';
	import LiteralComponent from '$lib/LiteralComponent.svelte';

	interface Props {
		clause: Clause;
	}
	let { clause }: Props = $props();
</script>

<div class="flex flex-row">
	{#each clause as literal (literal.id)}
		<LiteralComponent {literal} />
	{/each}
</div>
