<script lang="ts">
	import type Literal from '$lib/transversal/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

	interface Props {
		literal: Literal;
	}

	let { literal}: Props = $props();
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
		color: #c7c7c7;
	}

	.false {
		color: #d62728;
	}

	.true {
		color: #1f77b4;
	}

	.literal-component {
		height: var(--literal-height);
		display: flex;
		flex-direction: column;
		justify-content: end;
	}
</style>
