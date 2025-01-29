<script lang="ts">
	import type Literal from './literal.svelte.ts';

  interface Props {
    literal: Literal
  }

  let {literal}: Props = $props();
</script>

<div
  class="literal flex"
  class:undefined={!literal.isDefined()}
  class:true={literal.isTrue()}
  class:false={literal.isFalse()}>
  <span class="text-center align-middle">
    {literal.polarity == 'Negative' ? "not" : ""}
    {literal.variable.id}
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

  .false {
    background-color: #ffd7d9;
  }

  .true {
    background-color: #bae6ff;
  }

</style>
