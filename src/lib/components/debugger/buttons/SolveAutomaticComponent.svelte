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

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

	function solveAutomatic() {
		updateAssignment('automated');
		stateMachineEventBus.emit('automatic_steps');
		userActionEventBus.emit('record');
		toggleTrailExpandEventBus.emit(true);
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Solve"
	onclick={solveAutomatic}
	disabled={finished || backtrackingState}
>
	<DynamicRender component={SolveIcon} props={{ size: 'md' }} />
</button>
