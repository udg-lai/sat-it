<script lang="ts">
	import {
		ForwardOutline,
		ChevronDoubleRightOutline,
		CaretRightOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { stateMachineEventBus } from '$lib/transversal/events.ts';
	interface Props {
		cdMode: boolean;
	}

	let { cdMode: upMode }: Props = $props();

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	class:invalidOption={!upMode}
	title="Step"
	onclick={() => {
		stateMachineEventBus.emit('step');
	}}
	disabled={!upMode}
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

<button
	class="btn general-btn"
	title="Next variable"
	class:invalidOption={!upMode}
	onclick={() => {
		stateMachineEventBus.emit('followingVariable');
	}}
	disabled={!upMode}
>
	<DynamicRender component={ForwardOutline} props={assignmentProps} />
</button>

<button
	class="btn general-btn"
	title="Finish unit propagations"
	class:invalidOption={!upMode}
	onclick={() => {
		stateMachineEventBus.emit('finishUP');
	}}
	disabled={!upMode}
>
	<DynamicRender component={ChevronDoubleRightOutline} props={assignmentProps} />
</button>
