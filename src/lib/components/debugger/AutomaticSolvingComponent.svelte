<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		userActionEventBus
	} from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import {
		ArrowRightOutline,
		BarsOutline,
	} from 'flowbite-svelte-icons';
	import './style.css';

	interface Props {
		finished: boolean;
		backtrackingState: boolean;
	}

	let { finished, backtrackingState }: Props = $props();

	const generalProps = {
		size: 'md'
	};
</script>

<general-debugger>
	<button
		class="btn general-btn"
		class:invalidOption={finished || backtrackingState}
		title="Solve trail"
		onclick={() => {
			updateAssignment('automated');
			stateMachineEventBus.emit('solve_trail');
			userActionEventBus.emit('record');
			toggleTrailExpandEventBus.emit(true);
		}}
		disabled={finished || backtrackingState}
	>
		<DynamicRender component={ArrowRightOutline} props={generalProps} />
	</button>

	<button
		class="btn general-btn"
		class:invalidOption={finished || backtrackingState}
		title="Solve"
		onclick={() => {
			updateAssignment('automated');
			stateMachineEventBus.emit('solve_all');
			userActionEventBus.emit('record');
			toggleTrailExpandEventBus.emit(true);
		}}
		disabled={finished || backtrackingState}
	>
		<DynamicRender component={BarsOutline} props={generalProps} />
	</button>

</general-debugger>

<style>
	general-debugger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
