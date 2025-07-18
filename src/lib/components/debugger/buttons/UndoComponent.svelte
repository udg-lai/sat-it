<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { userActionEventBus } from '$lib/events/events.ts';
	import { ReplyOutline } from 'flowbite-svelte-icons';
	import '../style.css';

	interface Props {
		btnUndoActive?: boolean;
	}

	let { btnUndoActive = true }: Props = $props();
</script>

<button
	class="btn general-btn"
	class:invalidOption={!btnUndoActive}
	title="Undo"
	disabled={!btnUndoActive}
	onclick={() => userActionEventBus.emit('undo')}
>
	<DynamicRender component={ReplyOutline} props={{ size: 'md' }} />
</button>
