<script lang="ts">
	import type Variable from "$lib/variable.svelte.ts";

    interface Props {
        variables: Set<Variable>
    }

    let {variables}: Props = $props();
</script>

<div class="flex flex-row">
  {#each variables as v (v.id)}
    {v.id}
  {/each}
</div>