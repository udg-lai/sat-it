<script lang="ts">
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';
	import type Literal from '$lib/entities/Literal.svelte.ts';

	interface Props {
		literals: Literal[];
		satisfiedClause: boolean;
		satisfiedLiterals: boolean;
	}

	let { literals, satisfiedClause, satisfiedLiterals }: Props = $props();
</script>

<plain-clause
	class:satisfied-background={satisfiedClause}
	class:unsatisfied-background={!satisfiedClause}
>
	{#each literals as lit, i (i)}
		<PlainLiteralComponent literal={lit} state={satisfiedLiterals ? 'satisfied' : 'unsatisfied'} />
	{/each}
</plain-clause>

<style>
	plain-clause {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: var(--vertical-clause-width);
		min-width: var(--vertical-clause-width);
		height: fit-content;
	}

	.satisfied-background {
		position: relative;
		background-color: var(--satisfied-color-o);
	}

	.satisfied-background::after {
		position: absolute;
		width: var(--vertical-clause-width);
		border-color: var(--satisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background {
		position: relative;
		background-color: var(--unsatisfied-color-o);
	}

	.unsatisfied-background::after {
		position: absolute;
		width: var(--vertical-clause-width);
		height: 1px;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background::before {
		position: absolute;
		bottom: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}
</style>
