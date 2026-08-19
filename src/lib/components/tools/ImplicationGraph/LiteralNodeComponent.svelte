<script lang="ts">
	let {
		id,
		selected
	}: {
		id: string;
		selected: boolean;
	} = $props();
</script>

<div class:selected class="literal-node">
	{id}
</div>

<style>
	.literal-node {
		min-width: 32px;
		max-width: 60px;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 4px 4px;

		background: white;

		border: 2px solid #5a5a5a;

		border-radius: 8px;

		font-size: 14px;
	}

	.literal-node.selected {
		border-width: 4px;
	}
</style>
