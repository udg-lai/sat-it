<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import type { Trail, UPContext } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import CanvasComponent, { type CanvasContext, type UPRelation } from './CanvasComponent.svelte';
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

	function computeUPs(): CanvasContext {
		const upContext: Either<UPContext, undefined>[] = trail.getUPContext();
		return upContext.map((c) => {
			if (isLeft(c)) {
				const { clauseTag, literal }: UPContext = unwrapEither(c);
				const clause: Clause = getClause(clauseTag);
				return makeLeft({
					clause,
					literal
				});
			} else return makeRight(undefined);
		});
	}

	let ups: Either<UPRelation, undefined>[] = $derived.by(computeUPs);

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

<composed-trail class="composed-trail" class:opened-views={showUPView || showCAView}>
	{#if showUPView}
		<CanvasComponent
			context={ups}
			width={trailWidth}
			align={'end'}
			reverse={true}
			repeat={false}
			displayBackground={true}
		/>
	{/if}
	<div use:observeWidth class="fit-content" class:views-opened={showCAView || showUPView}>
		<TrailComponent {trail} {expanded} {isLast} {emitUndo} />
	</div>
	{#if showCAView}
		<CanvasComponent context={ups} width={trailWidth} align={'start'} />
	{/if}
</composed-trail>

<style>
	.composed-trail {
		display: flex;
		flex-direction: column;
	}

	.opened-views {
		background-color: var(--main-bg-color);
		border-radius: 10px;
	}

	.fit-content {
		width: fit-content;
	}

	.views-opened {
		background-color: var(--satisfied-color-o);
	}
</style>
