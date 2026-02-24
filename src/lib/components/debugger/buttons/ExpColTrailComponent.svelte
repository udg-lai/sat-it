<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import {
		getTrailsExpanded,
		setTrailsExpanded
	} from '$lib/states/decision-levels-expanded.svelte.ts';
	import '../style.css';
	import { asset } from '$app/paths';

	const expanded: boolean = $derived(getTrailsExpanded());

	let textCollapse = $derived(expanded ? 'Collapse propagations' : 'Expand propagations');

	let expandIcon = asset('/icons/Expand.svg');
	let collapseIcon = asset('/icons/Collapse.svg');

	function expandCollapse() {
		setTrailsExpanded(!expanded);
	}
</script>

<button class="btn general-btn" title={textCollapse} onclick={expandCollapse}>
	<ImageRender icon={expanded ? collapseIcon : expandIcon} alt={expanded ? 'Collapse' : 'Expand'} />
</button>
