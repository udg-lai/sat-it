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
	}

	.watch {
		position: relative;
	}

	.watch::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translate(-50%, 0px);
		width: 0;
		height: 0;
		border-left: 3px solid transparent;
		border-right: 3px solid transparent;
		border-bottom: 4px solid var(--inspecting-color);
	}
</style>
