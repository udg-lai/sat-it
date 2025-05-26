<script lang="ts">
	import DynamicRender from "$lib/components/DynamicRender.svelte";
	import { CogOutline } from "flowbite-svelte-icons";

	interface Props {
		headingClass: string;
		iconClass: { size: string };
		bodyClass: string;
	}

	let { headingClass, iconClass, bodyClass }: Props = $props();
</script>

<div class={headingClass}>
  <DynamicRender component={CogOutline} props={iconClass} />
  <span class="pt-1">General Settings</span>
</div>
<div class={bodyClass}>

</div>