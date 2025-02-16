<script lang="ts">

	interface Props {
		// only components that have at most the "prop"
		// property required can be passed
		component: any;
        props?: {string: any}[]
	}

	let { component, props }: Props = $props();
</script>

<scrollable-area>
    {@render component(props)}
</scrollable-area>

<style>
	scrollable-area {
        padding: var(--windows-padding);
		position: absolute;
		height: 100%;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
		overflow: auto;
		-ms-overflow-style: none; /* Internet Explorer 10+ */
		scrollbar-width: none; /* Firefox */
	}

	scrollable-area::-webkit-scrollbar {
		display: none; /* Safari and Chrome */
	}
</style>
