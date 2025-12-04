<script lang="ts">
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		userActionEventBus
	} from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import '../style.css';
	import automaticSteps from '$lib/icons/Automatic Steps.svg'
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

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
	<ImageRender icon={automaticSteps} alt="Automatic steps" />
</button>
