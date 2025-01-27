<script lang="ts">
  import {Variable} from '$lib/variable.ts';

  interface Props {
    variable: Variable,
    polarity: boolean
  }

  let {variable, polarity}: Props = $props();

  console.log(variable, polarity)
</script>

<div
  class="literal flex"
  class:undefined={!variable.isAssigned()}
  class:true={variable.isAssigned() && variable.getEval()()}
  class:false={variable.isAssigned() && !variable.getEval()}>
  <span class="text-center align-middle">
    {JSON.stringify(variable)} - Polarity: {polarity}
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
