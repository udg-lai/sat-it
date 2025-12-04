<script lang="ts">
	import { stateMachineEventBus } from '$lib/events/events.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import '../style.css';

	interface Props {
		myClass?: string;
		icon: string;
		alt: string;
	}

	let { myClass = '', icon, alt }: Props = $props();
</script>

<button
	class="btn general-btn {myClass}"
	onclick={() => {
		stateMachineEventBus.emit('step');
	}}
	title="Step"
>
	<ImageRender {icon} {alt} />
</button>
