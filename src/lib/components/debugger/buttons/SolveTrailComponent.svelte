<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import finishTrail from '$lib/icons/Finish Trail.svg'
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

	function completeTrail(): void {
		getSolverMachine().disableStops();
		updateAssignment('automated');
		stateMachineEventBus.emit('solve_trail');
		toggleTrailExpandEventBus.emit(true);
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Finish trail"
	onclick={completeTrail}
	disabled={finished || backtrackingState}
>
	<ImageRender icon={finishTrail} alt="Finish Trail" />
</button>
