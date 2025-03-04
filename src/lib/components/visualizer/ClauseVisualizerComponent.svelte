<script lang="ts">
	import LiteralComponent from '$lib/components/LiteralComponent.svelte';
	import type Clause from '$lib/transversal/entities/Clause.ts';

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
