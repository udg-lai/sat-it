<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { ctrlZEventBus } from '$lib/events/events.ts';

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
	onclick={() => ctrlZEventBus.emit()}
>
	<ImageRender icon={undoIcon} alt="User undo icon" />
</button>
