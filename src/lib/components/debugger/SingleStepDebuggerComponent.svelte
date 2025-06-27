<script lang="ts">
	import { stateMachineEventBus } from '$lib/events/events.ts';
	import { resetStack } from '$lib/states/stack.svelte.ts';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import './style.css';

	const assignmentProps = {
		size: 'md'
	};
</script>

<init-step>
	<button
		class="btn general-btn"
		onclick={() => {
			resetStack();
			stateMachineEventBus.emit('step');
		}}
		title="Step"
	>
		<DynamicRender component={CaretRightOutline} props={assignmentProps} />
	</button>
</init-step>
