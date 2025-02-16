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
	<div class="options-tools">
		<div class="vertical-separator"></div>
		<div class="toggle-button">
			<Button outline on:click={onToggleBtn} class="!p-2">
				<ArrowRightOutline class="h-5 w-5" />
			</Button>
		</div>
		<div class="toggle-button">
			<Button outline on:click={onToggleBtn} class="!p-2">
				<ArrowRightOutline class="h-5 w-5" />
			</Button>
		</div>
		<div class="toggle-button">
			<Button outline on:click={onToggleBtn} class="!p-2">
				<ArrowRightOutline class="h-5 w-5" />
			</Button>
		</div>
		<div class="toggle-button">
			<Button outline on:click={onToggleBtn} class="!p-2">
				<ArrowRightOutline class="h-5 w-5" />
			</Button>
		</div>
		<div class="toggle-button">
			<Button outline on:click={onToggleBtn} class="!p-2">
				<ArrowRightOutline class="h-5 w-5" />
			</Button>
		</div>
	</div>
	<div class="tools" class:hide></div>
</div>

<style>
	.options-tools {
		position: relative;
		padding: 1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.options-tools > .toggle-button:not(:last-child) {
		margin-bottom: 1rem;
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
