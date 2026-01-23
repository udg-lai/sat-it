<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { solverCommandEventBus } from '$lib/events/events.ts';
	import { asset } from '$app/paths';
	import '../style.css';

	interface Props {
		finished?: boolean;
		onConflictDetection?: boolean;
	}

	let { finished = false, onConflictDetection = false }: Props = $props();
	let backtrackingIcon = asset('/icons/Backtracking.svg');
</script>

<button
	class="btn general-btn conflict-btn join"
	class:invalidOption={finished || onConflictDetection}
	onclick={() => {
		solverCommandEventBus.emit('step');
	}}
	title="Backtrack"
	disabled={finished || onConflictDetection}
>
	<ImageRender icon={backtrackingIcon} alt="Resolve Conflict" />
</button>

<style>
	.join {
		border-radius: 6px;
	}
</style>
