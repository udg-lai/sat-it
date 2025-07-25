<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import type { ConflictAnalysisContext, Trail, UPContext } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import { error } from '$lib/utils.ts';
	import CanvasComponent, { type CanvasContext, type UPRelation } from './CanvasComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		expanded: boolean;
		isLast?: boolean;
		showUPView: boolean;
		showCAView: boolean;
		emitRevert?: (assignment: VariableAssignment) => void;
	}

	let { trail, expanded, isLast = true, showUPView, showCAView, emitRevert }: Props = $props();

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
			} else return makeRight(error);
		});
	}

	let unitPropagations: Either<UPRelation, () => never>[] = $derived.by(computeUPs);

	let conflictAnalysis: Either<ConflictAnalysisContext, () => never>[] = $derived.by(() => {
		if (!showCAView) return [];
		else if (!trail.hasConflictiveClause()) return [];
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
		<div class="up-view">
			<CanvasComponent
				context={unitPropagations}
				width={trailWidth}
				align={'end'}
				reverse={true}
				repeat={false}
			/>
		</div>
	{/if}
	<div use:observeWidth class="fit-content width-observer">
		<div class:views-opened={showCAView || showUPView}>
			<TrailComponent
				{trail}
				{expanded}
				{isLast}
				{emitRevert}
				detailsExpanded={showCAView || showUPView}
				showUPInfo={!showUPView}
			/>
		</div>
		<div class="empty-slot"></div>
	</div>
	{#if showCAView}
		<CanvasComponent context={conflictAnalysis} width={trailWidth} align={'start'} />
	{/if}
</composed-trail>

<style>
	.composed-trail {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.opened-views {
		background-color: var(--main-bg-color);
		border-radius: 10px;
	}

	.width-observer {
		display: flex;
	}

	.fit-content {
		width: fit-content;
	}

	.empty-slot {
		width: var(--empty-slot);
		background-color: transparent;
		height: auto;
	}

	.up-view {
		display: flex;
		flex-direction: column;
		position: relative;
		top: 7.5px;
	}
</style>
