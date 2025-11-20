<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		userActionEventBus
	} from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import SolveIcon from './SolveIcon.svelte';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Solve"
	onclick={() => {
		getSolverMachine().enableStops();
		updateAssignment('automated');
		stateMachineEventBus.emit('automatic_steps');
		userActionEventBus.emit('record');
		toggleTrailExpandEventBus.emit(true);
	}}
	disabled={finished || backtrackingState}
>
	<DynamicRender component={SolveIcon} props={{ size: 'md' }} />
</button>
