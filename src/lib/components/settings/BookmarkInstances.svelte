<script lang="ts">
	import { instanceStore } from '$lib/store/instances.store.ts';
	import { DatabaseOutline, LockOutline, TrashBinOutline } from 'flowbite-svelte-icons';
</script>

<div class="bookmark">
	<div class="bookmark-list">
		{#if $instanceStore}
			<ul class="items scrollable">
				{#each $instanceStore as instance}
					<li class="item">
						<button class="icon not-removable" disabled={!instance.removable || instance.active}>
							{#if instance.removable && !instance.active}
								<TrashBinOutline />
							{:else if instance.removable && instance.active}
								<LockOutline />
							{:else}
								<DatabaseOutline />
							{/if}
						</button>
						<p>{instance.name}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="bookmark-preview"></div>
</div>

<!--
{#if instanceStore}
	<ul>
		{#each $instanceStore as instance (instance.name)}
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
					<p class="mb-2 text-gray-500 dark:text-gray-400">{instance.name}</p>
				</div>
				<div class="flex">
					<button class="icon">
						<EyeOutline class={instance.previewing ? '' : 'not-previewing'} } />
					</button>
					<Toggle checked={instance.active} disabled={instance.active} class="toggle" />
				</div>
			</li>
		{/each}
	</ul>
{/if}
-->

<style>
	:global(.not-previewing) {
		opacity: 0.5;
	}

	.bookmark {
		height: 100%;
		width: 100%;
		display: flex;
	}

	.padding {
		padding: 1rem;
	}

	.bookmark-list {
		width: 60%;
		border-right: solid 1px;
		display: flex;
		align-items: center;
	}

	.bookmark-preview {
		flex: 1;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		width: 100%;
	}

	.scrollable {
		height: 80%;
		overflow: auto;
		scrollbar-width: none;
	}

	.scrollable::-webkit-scrollbar {
		display: none;
	}

	.item {
		display: flex;
		align-items: center;
		display: flex;
		position: relative;
		padding: 1rem;
		gap: 0.5rem;
		width: 100%;
	}

	.item p {
		margin: 0;
		margin-top: 0.5rem;
	}

	.item-btn {
		padding: 5px;
	}

	:global(.toggle) {
		padding-left: 5px;
		--tw-grayscale: 0%;
		--tw-contrast: 1;
	}
</style>
