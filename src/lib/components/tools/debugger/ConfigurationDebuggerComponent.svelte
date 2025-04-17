<script lang="ts">
	let selectedAlgorithm: string = $state('backtracking');
</script>

<div class="mb-1 ml-1 flex h-full w-full items-center justify-center">
	<div class="flex w-full max-w-xs flex-col items-center justify-center">
		<label for="algorithm" class="mb-2 text-base font-semibold text-gray-700">Algorithm</label>
		<select id="algorithm" bind:value={selectedAlgorithm} class="select-box">
			<option value="backtracking">Backtracking</option>
			<option value="dpll">DPLL</option>
			<option value="cdcl">CDCL</option>
		</select>
	</div>
</div>

<style>
	.select-box {
		cursor: pointer;
		position: relative;
		width: 100%;
		background: #ececec;
		padding: 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid #ccc;
	}
</style>
