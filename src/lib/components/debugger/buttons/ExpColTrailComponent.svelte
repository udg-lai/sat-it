<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import { getTrailsExpanded, setTrailsExpanded } from '$lib/states/decision-levels-expanded.svelte.ts';
	import '../style.css';

	const expanded:boolean = $derived(getTrailsExpanded());

	let textCollapse = $derived(expanded ? 'Collapse propagations' : 'Expand propagations');

	let expandIcon = '/icons/Expand.svg';
	let collapseIcon = '/icons/Collapse.svg';

	const expCol = (): void => {
		setTrailsExpanded(!expanded)
	};
</script>

<button class="btn general-btn" title={textCollapse} onclick={expCol}>
	<ImageRender icon={expanded ? collapseIcon : expandIcon} alt={expanded ? 'Collapse' : 'Expand'} />
</button>
