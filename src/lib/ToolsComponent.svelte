<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { ArrowRightOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';

	interface Props {
		hide: boolean;
	}

	let { hide: hide }: Props = $props();

	function onToggleBtn() {
		hide = !hide;
	}
</script>

<div class="tools-container">
	<div class="options-tools" class:separator-options={!hide}>
		<div class="toggle-button">
			<Button on:click={onToggleBtn} pill={true} class="!p-2">
				{#if hide}
					<ArrowLeftOutline class="h-5 w-5" />
				{:else}
					<ArrowRightOutline class="h-5 w-5" />
				{/if}
			</Button>
		</div>
	</div>
	<div class="tools" class:hide={hide}></div>
</div>

<style>
	.options-tools {
		width: 3rem;
		padding: 0.5rem 0rem;
		display: flex;
		justify-content: center;
	}
    
    .separator-options {
        border-width: 0px 1px 0px 0px;
        border-color: var(--border-color);
    }

	.tools {
		width: var(--width);
	}

	.tools-container {
		height: 100%;
		display: flex;
		position: relative;
	}

	.hide {
		width: 0;
	}
</style>
