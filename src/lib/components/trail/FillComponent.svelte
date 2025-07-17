<script lang="ts">
	import { isRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import { type CanvasContext, type UPRelation } from './CanvasComponent.svelte';

	interface Props {
		context: CanvasContext;
		width: number;
	}

	function isPrintable(ctx: Either<UPRelation, () => never>): boolean {
		if (isRight(ctx)) return false;
		else {
			const upCtx = unwrapEither(ctx);
			const literals = upCtx.clause.getLiterals();
			const filtered = literals.filter((lit) => lit.toInt() !== upCtx.literal);
			return filtered.length >= 1;
		}
	}

	let { context, width }: Props = $props();
</script>

<fill-component style="--width: {width}px">
	{#each context as ctx}
		{#if isPrintable(ctx)}
			<div class="fill-space-wrapper">
				<div class="fill-space paint-background" style="--height: 10px"></div>
			</div>
		{:else}
			<div class="fill-space-wrapper">
				<div class="fill-space" style="--height: 0px"></div>
			</div>
		{/if}
	{/each}
</fill-component>

<style>
	fill-component {
		width: var(--width);
		display: flex;
	}

	.fill-space-wrapper {
		padding: 0 calc(4px + 0.25rem);
		min-width: 55px;
	}

	.fill-space {
		width: 40px;
		height: var(--height);
		border-right: 1px solid;
		border-left: 1px solid;
		border-color: var(--satisfied-border-color-o);
	}

	.paint-background {
		background-color: var(--satisfied-color-o);
	}
</style>
