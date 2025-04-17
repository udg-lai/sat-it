<script lang="ts">
  let selectedAlgorithm: string = $state("backtracking");
</script>
  


<div class="flex items-center justify-center h-full w-full ml-1 mb-1">
  <div class="flex flex-col w-full max-w-xs items-center justify-center">
    <label for="algorithm" class="mb-2 font-semibold text-gray-700 text-base">Algorithm</label>
    <select
      id="algorithm"
      bind:value={selectedAlgorithm}
      class="select-box"
    >
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