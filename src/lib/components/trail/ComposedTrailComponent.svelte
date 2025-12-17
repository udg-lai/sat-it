<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type { ResolutionContext, UPContext } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import type { ComposedTrail, NeverFn } from '$lib/types/types.ts';
	import { error } from '$lib/utils.ts';
	import CanvasComponent, { type CanvasContext } from './CanvasComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: ComposedTrail;
		emitRevert?: (assignment: VariableAssignment) => void;
	}

	let { trail, emitRevert }: Props = $props();

	function computeUPs(): CanvasContext {
		const upContext: Either<UPContext, NeverFn>[] = trail.trail.getUPContext();
		return upContext.map((c) => {
			if (isLeft(c)) {
				const { reasonCRef, propagated }: UPContext = unwrapEither(c);
				const clause: Clause = getClausePool().at(reasonCRef);
				return makeLeft({
					clause,
					hidden: [propagated]
				});
			} else return makeRight(error);
		});
	}

	function computeResolutions(): CanvasContext {
		if (!trail.showCA) return [];
		else if (!trail.trail.hasConflictiveClause()) return [];
		else {
			const resolutionContext: Either<ResolutionContext, NeverFn>[] =
				trail.trail.getResolutionContext();
			return resolutionContext.map((c) => {
				if (isLeft(c)) {
					const { clause }: ResolutionContext = unwrapEither(c);
					return makeLeft({
						clause,
						hidden: []
					});
				} else return makeRight(error);
			});
		}
	}

	let unitPropagations: CanvasContext = $derived.by(computeUPs);
	let resolutions: CanvasContext = $derived.by(computeResolutions);

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
</script>

<composed-trail class="composed-trail" class:opened-views={trail.showUPs || trail.showCA}>
	{#if trail.showUPs}
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
		<div class:views-opened={trail.showCA || trail.showUPs}>
			<TrailComponent {trail} {emitRevert} />
		</div>
		<div class="empty-slot"></div>
	</div>
	{#if trail.showCA}
		<CanvasComponent context={resolutions} width={trailWidth} align={'start'} />
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
