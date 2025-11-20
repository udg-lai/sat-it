<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		userActionEventBus
	} from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
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
	title="Solve trail"
	onclick={() => {
		getSolverMachine().disableStops();
		updateAssignment('automated');
		stateMachineEventBus.emit('solve_trail');
		userActionEventBus.emit('record');
		toggleTrailExpandEventBus.emit(true);
	}}
	disabled={finished || backtrackingState}
>
	<DynamicRender component={ArrowRightOutline} props={{ size: 'md' }} />
</button>
