<script lang="ts">
	import { Toggle } from 'flowbite-svelte';
	import { DatabaseOutline, EyeOutline, LockOutline, TrashBinOutline } from 'flowbite-svelte-icons';

	interface Preview {
		removable: boolean;
		active: boolean;
		previewing: boolean;
		instanceName: string;
	}

	interface Props {
		preview: Preview[];
		onActivate: (instanceName: string) => void;
		onPreview: (instanceName: string) => void;
		onRemove: (instanceName: string) => void;
	}

	let { preview, onActivate, onPreview, onRemove }: Props = $props();

	function emitOnActive({ instanceName }: Preview) {
		onActivate(instanceName);
	}
</script>

<ul>
	{#each preview as instance (instance.instanceName)}
		<li>
			<div class="flex">
				<button class="icon not-removable" disabled={!instance.removable || instance.active}>
					{#if instance.removable && !instance.active}
						<TrashBinOutline onclick={() => onRemove(instance.instanceName)} />
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
					<EyeOutline
						class={instance.previewing ? '' : 'not-previewing'}
						onclick={() => onPreview(instance.instanceName)}
					/>
				</button>
				<Toggle
					onchange={() => emitOnActive(instance)}
					checked={instance.active}
					disabled={instance.active}
					class="toggle"
				/>
			</div>
		</li>
	{/each}
</ul>

<style>
	:global(.not-previewing) {
		opacity: 0.5;
	}

	ul li {
		display: flex;
		align-items: center;
		display: flex;
		position: relative;
		justify-content: space-between;
		padding: 10px;
	}

	ul li p {
		margin: 0px !important;
		padding: 5px;
	}

	li button {
		padding: 5px;
	}

	:global(.toggle) {
		padding-left: 5px;
		--tw-grayscale: 0%;
		--tw-contrast: 1;
	}
</style>
