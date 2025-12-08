<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import '../style.css';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

	let solveIcon = '/icons/Solve.svg';

	function solveProblem(): void {
		updateAssignment('automated');
		stateMachineEventBus.emit('solve_all');
		toggleTrailExpandEventBus.emit(true);
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Solve"
	onclick={solveProblem}
	disabled={finished || backtrackingState}
>
	<ImageRender icon={solveIcon} alt="Solve" />
</button>
