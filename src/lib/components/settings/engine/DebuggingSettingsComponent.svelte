<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { BugOutline } from 'flowbite-svelte-icons';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
</script>

<div class={headingClass}>
	<DynamicRender component={BugOutline} props={iconClass} />
	<span class="pt-1">Debugging Settings</span>
</div>
<div class={bodyClass}></div>
