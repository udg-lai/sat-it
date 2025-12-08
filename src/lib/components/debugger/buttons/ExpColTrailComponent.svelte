<script lang="ts">
	import '../style.css';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	interface Props {
		expanded?: boolean;
		toggleExpand?: () => void;
	}

	let { expanded = true, toggleExpand }: Props = $props();

	let textCollapse = $derived(expanded ? 'Collapse propagations' : 'Expand propagations');

	let expandIcon = '/icons/Expand.svg';
	let collapseIcon = '/icons/Collapse.svg';

	const checkIfFunction = (): void => {
		if (toggleExpand != undefined) toggleExpand();
		else {
			expanded = !expanded;
		}
	};
</script>

<button class="btn general-btn" title={textCollapse} onclick={checkIfFunction}>
	<ImageRender icon={expanded ? collapseIcon : expandIcon} alt={expanded ? 'Collapse' : 'Expand'} />
</button>
