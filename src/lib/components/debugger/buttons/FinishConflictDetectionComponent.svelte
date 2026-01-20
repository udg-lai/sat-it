<script lang="ts">
	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { asset } from '$app/paths';

	let upnIcon = asset('/icons/UPn.svg');

	function finishConflictDetection(): void {
		getSolverMachine().disableStepDelay();
		expandEditorTrailsEventBus.emit(true);
		solverCommandEventBus.emit('finishCD');
	}
</script>

<button class="btn general-btn" title="Finish CD" onclick={finishConflictDetection}>
	<ImageRender icon={upnIcon} alt="Finish UPs" />
</button>
