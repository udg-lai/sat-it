<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, updateTrailsEventBus } from '$lib/events/events.ts';
	import { CodeMergeOutline } from 'flowbite-svelte-icons';
	import '../style.css';

	interface Props {
		finished?: boolean;
		onConflictDetection?: boolean;
	}

	let { finished = false, onConflictDetection = false }: Props = $props();
</script>

<button
	class="btn general-btn conflict-btn join"
	class:invalidOption={finished || onConflictDetection}
	onclick={() => {
		stateMachineEventBus.emit('step');
		updateTrailsEventBus.emit();
	}}
	title="Backtrack"
	disabled={finished || onConflictDetection}
>
	<DynamicRender component={CodeMergeOutline} props={{ size: 'md' }} />
</button>

<style>
	.join {
		border-radius: 6px;
	}
</style>
