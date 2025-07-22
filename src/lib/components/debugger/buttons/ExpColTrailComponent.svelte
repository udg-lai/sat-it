<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import '../style.css';

	interface Props {
		expanded?: boolean;
		toggleExpand?: () => void;
	}

	let { expanded = true, toggleExpand }: Props = $props();

	let textCollapse = $derived(expanded ? 'Collapse propagations' : 'Expand propagations');

	const checkIfFunction = (): void => {
		if (toggleExpand != undefined) toggleExpand();
		else {
			expanded = !expanded;
		}
	};
</script>

<button class="btn general-btn" title={textCollapse} onclick={checkIfFunction}>
	<DynamicRender
		component={expanded ? ChevronLeftOutline : ChevronRightOutline}
		props={{ size: 'md' }}
	/>
</button>
