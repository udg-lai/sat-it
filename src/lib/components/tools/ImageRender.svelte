<script lang="ts">
	interface Props {
		icon: string;
		alt: string;
	}
	let { icon, alt }: Props = $props();
</script>

<img src={icon} {alt} class="image_class" />

<style>
	.image_class {
		padding: 6px;
	}
</style>
