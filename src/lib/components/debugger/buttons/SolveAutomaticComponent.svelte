<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import { asset } from '$app/paths';
	import '../style.css';

	interface Props {
		finished?: boolean;
		backtrackingState?: boolean;
	}

	let { finished = false, backtrackingState = false }: Props = $props();

	let automaticStepsIcon = asset('/icons/Automatic Steps.svg');

	function solveAutomatic() {
		updateAssignment('automated');
		solverCommandEventBus.emit('automatic_steps');
		expandEditorTrailsEventBus.emit(true);
	}
</script>

<button
	class="btn general-btn"
	class:invalidOption={finished || backtrackingState}
	title="Automatic solving"
	onclick={solveAutomatic}
	disabled={finished || backtrackingState}
>
	<ImageRender icon={automaticStepsIcon} alt="Automatic steps" />
</button>
