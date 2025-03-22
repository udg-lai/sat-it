<script lang="ts">
</script>

<div class="flex-center debugger flex">
	<button class="btn" onclick={() => console.log('decide')}>
		<h1>Decide</h1>
	</button>

	<button class="btn" onclick={() => console.log('visualize')}>
		<h1>Toggle</h1>
	</button>
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		background-color: antiquewhite;
		display: flex;
		justify-content: space-around;
	}

	.btn {
		background-color: aqua;
		width: 10rem;
		height: 10rem;
	}
</style>
