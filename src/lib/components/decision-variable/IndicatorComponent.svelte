<script lang="ts">
	import { AssignmentReason } from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
	import MathTexComponent from '../MathTexComponent.svelte';

	interface Props {
		reason: AssignmentReason;
	}

	let { reason }: Props = $props();

	let indicatorTeX = reason === AssignmentReason.D ? 'd' : reason === AssignmentReason.K ? 'k' : '';
</script>

<div class="indicator">
	<MathTexComponent equation={indicatorTeX} />
</div>

<style>
	.indicator {
		height: 24px;
		width: 24px;
		border-color: var(--border-color);
		border-width: 1px;
		background-color: red;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
