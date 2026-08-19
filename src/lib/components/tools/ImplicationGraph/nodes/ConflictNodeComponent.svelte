<script lang="ts">
	let {
		id,
		selected
	}: {
		id: string;
		selected: boolean;
	} = $props();
</script>

<div class:selected class="conflict-node">⊥</div>

<style>
	.conflict-node {
		width: 30px;
		height: 30px;

		display: flex;
		align-items: center;
		justify-content: center;

		background: #fee2e2;

		border: 2px solid #dc2626;

		border-radius: 50%;

		font-size: 24px;
		font-weight: bold;
	}

	.conflict-node.selected {
		border-width: 4px;
	}
</style>
