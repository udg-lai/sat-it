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
	<div class="tools" class:hide={hide}></div>
</div>

<style>
	.options-tools {
		width: 3rem;
		padding: 0.5rem 0rem;
		display: flex;
        flex-direction: column;
		align-items: center;
	}

    .options-tools > .toggle-button:not(:last-child) {
        margin-bottom: 1rem;
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
