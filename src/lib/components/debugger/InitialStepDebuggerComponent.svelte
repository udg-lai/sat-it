<script lang="ts">
	import './_style.css';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { stateMachineEventBus } from '$lib/transversal/events.ts';
	import { resetStack } from '$lib/store/stack.svelte.ts';

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
