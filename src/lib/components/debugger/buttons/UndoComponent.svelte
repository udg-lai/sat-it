<script lang="ts">
	import { userActionEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	interface Props {
		btnUndoActive?: boolean;
	}

	let { btnUndoActive = true }: Props = $props();
	let undoIcon = '/icons/User Undo.svg';
</script>

<button
	class="btn general-btn"
	class:invalidOption={!btnUndoActive}
	title="Undo"
	disabled={!btnUndoActive}
	onclick={() => userActionEventBus.emit('undo')}
>
	<ImageRender icon={undoIcon} alt="User undo icon" />
</button>
