<script lang="ts">
	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { asset } from '$app/paths';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

	let finishTrailIcon = asset('/icons/Finish Trail.svg');

	function completeTrail(): void {
		getSolverMachine().disableStepDelay();
		updateAssignment('automated');
		solverCommandEventBus.emit('solve_trail');
		expandEditorTrailsEventBus.emit(true);
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Finish trail"
	onclick={completeTrail}
	disabled={finished || backtrackingState}
>
	<ImageRender icon={finishTrailIcon} alt="Finish Trail" />
</button>
