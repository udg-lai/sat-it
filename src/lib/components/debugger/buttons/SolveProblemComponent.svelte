<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import SolveIcon from './SolveIcon.svelte';
	import '../style.css';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

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
	<DynamicRender component={SolveIcon} props={{ size: 'md' }} />
</button>
