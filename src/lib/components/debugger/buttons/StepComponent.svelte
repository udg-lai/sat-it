<script lang="ts">
	import { stateMachineEventBus } from '$lib/events/events.ts';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../../DynamicRender.svelte';
	import '../style.css';

	interface Props {
		myClass?: string;
	}

	let { myClass = '' }: Props = $props();

	const assignmentProps = {
		size: 'md'
	};
</script>

<button
	class="btn general-btn {myClass}"
	onclick={() => {
		stateMachineEventBus.emit('step');
	}}
	title="Step"
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>
