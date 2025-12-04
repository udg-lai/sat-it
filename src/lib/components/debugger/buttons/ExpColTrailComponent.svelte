<script lang="ts">
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import expand from '$lib/icons/Expand.svg'
	import collapse from '$lib/icons/Collapse.svg'

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
	<ImageRender
		icon={expanded ? collapse : expand}
		alt={expanded ? 'Collapse' : 'Expand'}
	/>
</button>
