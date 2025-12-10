<script lang="ts">
	import { userActionEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	interface Props {
		btnRedoActive?: boolean;
	}

	let { btnRedoActive = true }: Props = $props();

	let redoIcon = '/icons/User Redo.svg';
</script>

<button
	class="btn general-btn"
	class:invalidOption={!btnRedoActive}
	title="Redo"
	onclick={() => userActionEventBus.emit('redo')}
	disabled={!btnRedoActive}
>
	<ImageRender icon={redoIcon} alt="User redo icon" />
</button>
