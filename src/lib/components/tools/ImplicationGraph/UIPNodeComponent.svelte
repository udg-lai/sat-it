<script lang="ts">
	let {
		id,
		selected
	}: {
		id: string;
		selected: boolean;
	} = $props();
</script>

<div class:selected class="uip-node">
	{id}
</div>

<style>
	.uip-node {
		min-width: 60px;
		min-height: 30px;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 4px 12px;

		background: white;

		border: 2px solid #444;

		border-radius: 8px;

		font-size: 14px;
	}

	.uip-node.selected {
		border-width: 4px;
	}
</style>
