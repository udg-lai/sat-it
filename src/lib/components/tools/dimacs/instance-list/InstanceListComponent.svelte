<script lang="ts">
	import {  type InteractiveInstance } from '$lib/store/instances.store.ts';
	import { Toggle } from 'flowbite-svelte';
	import { DatabaseOutline, EyeOutline, LockOutline, TrashBinOutline } from 'flowbite-svelte-icons';

	interface Props {
		instances: InteractiveInstance[];
		onActivate: (instance: InteractiveInstance) => void
	}

	let { instances = $bindable(), onActivate }: Props = $props();
</script>

<ul>
	{#each instances as instance}
		<li>
			<div class="flex">
				<button class="icon not-removable" disabled={!instance.removable || instance.active}>
					{#if instance.removable && !instance.active}
						<TrashBinOutline />
					{:else if instance.removable && instance.active}
						<LockOutline />
					{:else}
						<DatabaseOutline />
					{/if}
				</button>
				<p class="mb-2 text-gray-500 dark:text-gray-400">{instance.instanceName}</p>
			</div>
			<div class="flex">
				<button class="icon">
					<EyeOutline />
				</button>
				<Toggle
					onchange={() => onActivate(instance)}
					bind:checked={instance.active}
					disabled={instance.active}
					class="toggle"
				/>
			</div>
		</li>
	{/each}
</ul>
