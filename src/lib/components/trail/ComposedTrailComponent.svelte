<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import type { ComposedTrail } from '$lib/types/types.ts';
	import ResolutionContextComponent from './ResolutionContextComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';
	import UPContextComponent from './UPContextComponent.svelte';

	interface Props {
		trail: ComposedTrail;
		emitRevert?: (assignment: VariableAssignment) => void;
	}

	let { trail, emitRevert }: Props = $props();
</script>

<composed-trail class="composed-trail" class:opened-views={trail.showUPs || trail.showCA}>
	{#if trail.showUPs}
		<div class="up-view">
			<UPContextComponent trail={trail.trail} />
		</div>
	{/if}
	<div id={'trail_' + trail.id} class="fit-content width-observer">
		<div class:views-opened={trail.showCA || trail.showUPs}>
			<TrailComponent composedTrail={trail} {emitRevert} />
		</div>
		<div class="empty-slot"></div>
	</div>
	{#if trail.showCA}
		<ResolutionContextComponent trail={trail.trail} />
	{/if}
</composed-trail>

<style>
	.up-view {
		position: relative;
		width: fit-content;
	}

	.up-view > * {
		position: relative;
		top: var(--composed-top);
	}

	composed-trail {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: fit-content;
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
		max-height: var(--trail-height);
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
		top: var(--composed-top);
		flex: 1;
	}
</style>
