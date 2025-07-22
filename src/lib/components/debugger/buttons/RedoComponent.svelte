<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { userActionEventBus } from '$lib/events/events.ts';
	import { ReplyOutline } from 'flowbite-svelte-icons';
	import '../style.css';

	interface Props {
		btnRedoActive?: boolean;
	}

	let { btnRedoActive = true }: Props = $props();

	const reverseProps = {
		class: 'transform -scale-x-100',
		size: 'md'
	};
</script>

<button
	class="btn general-btn"
	class:invalidOption={!btnRedoActive}
	title="Redo"
	onclick={() => userActionEventBus.emit('redo')}
	disabled={!btnRedoActive}
>
	<DynamicRender component={ReplyOutline} props={reverseProps} />
</button>
