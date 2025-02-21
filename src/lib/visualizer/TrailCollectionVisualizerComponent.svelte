<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { TrailCollection } from '$lib/trailCollection.svelte.ts';
  import TrailVisualizerComponent from '$lib/visualizer/TrailVisualizerComponent.svelte';
  
  interface Props {
    trailCollecion: TrailCollection;
  }
  let { trailCollecion }: Props = $props();
</script>

<div class="flex flex-col">
  {#each trailCollecion as trail}
    <p transition:slide >
      <TrailVisualizerComponent {trail} />
    </p>
	  
  {/each}
</div>