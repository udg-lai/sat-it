<script lang="ts">
	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { asset } from '$app/paths';

	let up1Icon = asset('/icons/UP1.svg');

	function finishConflictDetection(): void {
		getSolverMachine().disableStepDelay();
		solverCommandEventBus.emit('up1');
		expandEditorTrailsEventBus.emit(true);
	}
</script>

<button class="btn general-btn" title="One Unit Propagation" onclick={finishConflictDetection}>
	<ImageRender icon={up1Icon} alt="up1" />
</button>
