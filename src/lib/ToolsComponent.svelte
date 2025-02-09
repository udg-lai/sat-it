<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import { ArrowRightOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';

    interface Props {
        isOpen: boolean
    }

    let { isOpen }: Props = $props()

    function onToggleBtn() {
        isOpen = !isOpen
    }

    // your script goes here
</script>

<div class="tools-container" class:hide={!isOpen}>
    <div class="toggle-button">
        <Button on:click={onToggleBtn}  pill={true} class="!p-2">
            {#if isOpen}
                <ArrowLeftOutline  class="w-5 h-5" />
            {:else}
                <ArrowRightOutline class="w-5 h-5" />
            {/if}
        </Button>
    </div>
</div>

<style>
    .tools-container {
        width: var(--width);
        height: 100%;
		background-color: brown;
        display: flex;
        position: relative;
    }

    .toggle-button {
        position: absolute;
        right: -18px;
        top: 50%;
    }

    .hide {
        width: 0;
    }
</style>

