<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { CodePullRequestOutline } from 'flowbite-svelte-icons';

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
</script>

<div class={headingClass}>
	<DynamicRender component={CodePullRequestOutline} props={iconClass} />
	<span class="pt-1">Algorithm Settings</span>
</div>
<div class={bodyClass}></div>
