<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { TrailCollection } from '$lib/trailCollection.svelte.ts';
  import TrailVisualizerComponent from '$lib/visualizer/TrailVisualizerComponent.svelte';
  
  interface Props {
    trailCollection: TrailCollection;
    visualizeTrails: boolean;
  }
  let { trailCollection, visualizeTrails }: Props = $props();
</script>

<div class="flex flex-col">
  {#if visualizeTrails}
    {#each trailCollection as trail}
      <div transition:slide|global>
        <TrailVisualizerComponent {trail} />
      </div>
    {/each}
  {:else}
    <div in:slide|global out:slide={{duration:1}}>
      <TrailVisualizerComponent trail = {trailCollection.getCurrentTrailCopy()} />
    </div>
  {/if}
</div>