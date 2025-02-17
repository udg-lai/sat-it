<script lang="ts">
	import { ArrowRightOutline, ArrowLeftOutline, CodeBranchOutline } from 'flowbite-svelte-icons';
	import Button from './Button.svelte';

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
			<Button />
		</div>
		<div class="toggle-button">
			<Button />
		</div>
		<div class="toggle-button">
			<Button />
		</div>
		<div class="toggle-button">
		</div>
		<div class="toggle-button">
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
