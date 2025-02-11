<script lang="ts">
  import CNF, {CNFState} from '$lib/cnf.svelte.ts';
  import ClauseVisualizerComponent from '$lib/visualizer/ClauseVisualizerComponent.svelte';
  interface Props {
    cnf : CNF;
  }
  let { cnf }: Props = $props();

</script>

<div>
  {#each cnf.getClauses() as clause}
    <ClauseVisualizerComponent {clause}/>
  {/each}
  <p>The CNF is <strong>{cnf.evaluate()}</strong></p>
</div>