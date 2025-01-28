<script lang="ts">
	import type Literal from './literal.svelte.ts';

  interface Props {
    literal: Literal
  }

  let {literal}: Props = $props();

</script>

<div
  class="literal flex"
  class:undefined={true}
  class:true={false}
  class:false={false}>
  <span class="text-center align-middle">
  </span>
</div>

<style>

  .literal {
    height: 150px;
    width: 150px;
    border-radius: 50%;
    border: solid 1px;
  }

  .undefined {
    background-color: #e8daff;
  }

  .true {
    background-color: #ffd7d9;
  }

  .false {
    background-color: #bae6ff;
  }

</style>
