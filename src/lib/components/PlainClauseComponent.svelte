<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';
	import type Literal from '$lib/entities/Literal.svelte.ts';

	interface Props {
		clause: Clause;
		reverse?: boolean;
		hidden?: number[];
		state?: 'unsatisfied' | 'satisfied' | undefined;
	}

	let { clause, reverse = false, hidden = [], state }: Props = $props();

	const hiddenSet = new Set(hidden);

	let literals: Literal[] = $derived.by(() => {
		const lits = [...clause];
		const reversed = reverse ? lits.reverse() : lits;
		return reversed.filter((lit) => !hiddenSet.has(lit.toInt()));
	});
</script>

<clause
	class:satisfied-background={state === 'satisfied'}
	class:unsatisfied-background={state === 'unsatisfied'}
	class:temporal-background={state === undefined && clause.isTemporal()}
	class:lemma-background={state === undefined && !clause.isTemporal()}
>
	{#each literals as lit, i (i)}
		<PlainLiteralComponent
			literal={lit}
			{state}
			learned={state === undefined && !clause.isTemporal()}
		/>
	{/each}
</clause>

<style>
	clause {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: var(--vertical-clause-width);
		min-width: var(--vertical-clause-width);
	}

	.satisfied-background {
		position: relative;
	}

	.satisfied-background::after {
		position: absolute;
		width: var(--vertical-clause-width);
		border-top: 1px solid;
		border-color: var(--satisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background {
		position: relative;
	}

	.unsatisfied-background::after {
		position: absolute;
		width: var(--vertical-clause-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background::before {
		position: absolute;
		bottom: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}

	.temporal-background {
		position: relative;
	}

	.temporal-background::before {
		position: absolute;
		top: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--temporal-color);
		content: '';
	}

	.temporal-background::after {
		position: absolute;
		bottom: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-color: var(--temporal-color);
		content: '';
	}

	.lemma-background {
		position: relative;
	}

	.lemma-background::before {
		position: absolute;
		top: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-color: var(--lemma-border-color);
		content: '';
	}

	.lemma-background::after {
		position: absolute;
		bottom: 0px;
		width: var(--vertical-clause-width);
		height: 1px;
		border-color: var(--lemma-border-color);
		content: '';
	}
</style>
