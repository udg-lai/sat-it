<script lang="ts">
	import type Literal from '$lib/transversal/entities/Literal.svelte.ts';
	import MathTexComponent from '$lib/components/MathTexComponent.svelte';

  interface Props {
    literal: Literal
  }

  let {literal}: Props = $props();
</script>

<div class="literal flex"
  class:undefined={!literal.isDefined()}
  class:true={literal.isTrue()}
  class:false={literal.isFalse()}
>
  <MathTexComponent equation={literal.toTeX()} />
</div>

<style>
  .literal {
    height: 150px;
    width: 100%;
    border: solid 1px;
    align-items: center;
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
