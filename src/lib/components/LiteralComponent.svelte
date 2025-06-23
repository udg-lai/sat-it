<script lang="ts">
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
	}

	let { literal }: Props = $props();
</script>

<div
	class="literal-component"
	class:undefined={!literal.isAssigned()}
	class:true={literal.isTrue()}
	class:false={literal.isFalse()}
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
	}
</style>
