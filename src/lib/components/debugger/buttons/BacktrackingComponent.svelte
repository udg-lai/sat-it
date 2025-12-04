<script lang="ts">
	import { stateMachineEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import backtracking from '$lib/icons/Backtracking.svg'

	interface Props {
		finished?: boolean;
		onConflictDetection?: boolean;
	}

	let { finished = false, onConflictDetection = false }: Props = $props();
</script>

<button
	class="btn general-btn conflict-btn join"
	class:invalidOption={finished || onConflictDetection}
	onclick={() => {
		stateMachineEventBus.emit('step');
	}}
	title="Backtrack"
	disabled={finished || onConflictDetection}
>
	<ImageRender icon={backtracking} alt="Resolve Conflict" />
</button>

<style>
	.join {
		border-radius: 6px;
	}
</style>
