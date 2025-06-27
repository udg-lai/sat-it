<script lang="ts">
	import { onChrome } from '$lib/app.svelte.ts';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		literals: number[];
	}

	let { literals }: Props = $props();

	function toTeX(literal: number): string {
		const variable = Math.abs(literal);
		const negative = literal < 0;
		return negative ? `\\overline{${variable}}` : `${variable}`;
	}

	let chrome: boolean = $derived(onChrome());
</script>

<clause class={chrome ? 'pad-chrome' : 'pad-others'}>
	{#each literals as lit, i (i)}
		<MathTexComponent equation={toTeX(lit)} />
		{#if i < literals.length - 1}
			<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
		{/if}
	{/each}
</clause>

<style>
	clause {
		color: var(--clause-color);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
	}
</style>
