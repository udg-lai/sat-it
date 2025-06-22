<script lang="ts">
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		items: unknown[];
		itemSize: number;
	}

	let { items, itemSize }: Props = $props();

	let virtualHeight = $state(500);
	function observeHeight(htmlElement: HTMLElement) {
		const previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				virtualHeight = entry.contentRect.height - itemSize / 2;
				virtualHeight = Math.max(virtualHeight, 0);
			}
		});
		previewObserver.observe(htmlElement);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}
</script>

<div class="flex-virtual-wrapper" use:observeHeight>
	<VirtualList
		width="100%"
		height={virtualHeight}
		scrollDirection="vertical"
		itemCount={items.length}
		{itemSize}
	>
		<div slot="item" let:index let:style {style}>
			<!-- Slot for custom item rendering -->
			<slot name="item" item={items[index]} {index} />
		</div>
	</VirtualList>
</div>

<style>
	.flex-virtual-wrapper {
		width: 100%;
		flex: 1;
	}
</style>
