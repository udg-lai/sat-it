<script lang="ts">
	interface Props {
		image?: string;
		imageAlt?: string;
		description: string;
	}

	let { image='', imageAlt='', description }: Props = $props();
</script>

<div class="container">
	<div class="icon-zone">
		{#if image}
			<img alt={imageAlt} src={image} />
		{/if}
	</div>
	<div class="description-zone">
		{description}
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		height: 55px;
		border: 1px solid #ccc;
		border-radius: 6px;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.icon-zone {
		width: 50px;
		height: 100%;
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.description-zone {
		flex: 1;
		padding-left: 12px;
		padding-right: 5px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
	}
</style>
