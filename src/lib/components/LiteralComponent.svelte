<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
		watched: boolean;
	}

	let { literal, watched = false }: Props = $props();
</script>

<div
	class="literal-component"
	class:undefined={!literal.hasTruthValue()}
	class:true={literal.isTrue()}
	class:false={literal.isFalse()}
	class:watch={watched}
>
	<MathTexComponent equation={literal.toTeX()} />
</div>

<style>
	.undefined {
		color: var(--unassigned-color);
	}

	.false {
		color: var(--unsatisfied-color);
	}

	.true {
		color: var(--satisfied-color);
	}

	.literal-component {
		height: var(--literal-height);
		display: flex;
		flex-direction: column;
		justify-content: end;
		position: relative;
		padding-bottom: 0px;
	}

	.watch::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		transform: translateX(-50%);

		/* Triangle logic: change the size or color as needed */
		width: 0;
		height: 0;
		border-left: 3px solid transparent;
		border-right: 3px solid transparent;
		border-bottom: 4px solid black; /* Inherits the text color (true/false/undefined) */
	}
</style>
