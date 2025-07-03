<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import CanvasComponent from './CanvasComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		expanded: boolean;
		isLast?: boolean;
		showUPView: boolean;
		showCAView: boolean;
		emitUndo?: (assignment: VariableAssignment) => void;
	}

	let { trail, expanded, isLast = true, showUPView, showCAView, emitUndo }: Props = $props();

	let upContext: Either<Clause, undefined>[] = $derived.by(() => {
		const upContext: Either<number, undefined>[] = trail.getUPContext();
		return upContext.map((c) => {
			if (isLeft(c)) {
				return makeLeft(getClause(unwrapEither(c)));
			} else return makeRight(undefined);
		});
	});

	let caContext: Either<Clause, undefined>[] = $derived.by(() => {
		if (!showCAView) return [];
		else return trail.getConflictAnalysisCtx();
	});

	let clausePool: ClausePool = $derived(getClausePool());

	let trailWidth = $state(0);

	function observeWidth(element: HTMLElement) {
		const previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				trailWidth = entry.contentRect.width;
			}
		});
		previewObserver.observe(element);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}

	function getClause(clauseTag: number): Clause {
		return clausePool.get(clauseTag);
	}
</script>

<composed-trail class="composed-trail">
	{#if showUPView}
		<CanvasComponent context={upContext} width={trailWidth} align={'end'} reverse={true} />
	{/if}
	<div use:observeWidth class="fit-content">
		<TrailComponent {trail} {expanded} {isLast} {emitUndo} />
	</div>
	{#if showCAView}
		<CanvasComponent context={upContext} width={trailWidth} align={'start'} />
	{/if}
</composed-trail>

<style>
	.composed-trail {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.fit-content {
		width: fit-content;
	}
</style>
