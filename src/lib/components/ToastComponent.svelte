<script lang="ts">
	import { dismissToast, type Toast as NotificationToast } from '$lib/states/toasts.svelte.ts';
	import {
		CheckOutline,
		CloseCircleOutline,
		CloseOutline,
		ExclamationCircleOutline,
		FlagOutline
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	interface Props {
		toast: NotificationToast;
	}

	let { toast }: Props = $props();

	function selfClose(): void {
		if (toast.id) {
			dismissToast(toast.id);
		}
	}

	let show = $state(false);

	onMount(() => {
		const timeout = setTimeout(() => {
			show = true;
		}, 100);
		return () => {
			clearTimeout(timeout);
		};
	});
</script>

<div class="toast" class:active={show}>
	{#if toast.type === 'error'}
		<ExclamationCircleOutline color="red" slot="icon" class="h-5 w-5" />
	{:else if toast.type === 'warn'}
		<ExclamationCircleOutline color="orange" slot="icon" class="h-5 w-5" />
	{:else if toast.type === 'info'}
		<ExclamationCircleOutline color="blue" slot="icon" class="h-5 w-5" />
	{:else if toast.type === 'breakpoint'}
		<FlagOutline color="purple" class="h-5 w-5" />
	{:else if toast.type === 'sat'}
		<CheckOutline color="green" slot="icon" class="h-5 w-5" />
	{:else}
		<CloseOutline color="red" slot="icon" class="h-5 w-5" />
	{/if}

	<div class="flex items-center">
		<div class="ms-3">
			<h4 class="font-semibold text-gray-900">{toast.title}</h4>
			<div class="description font-normal">{toast.description}</div>
		</div>
	</div>
	<button class="close" onclick={selfClose}>
		<CloseCircleOutline />
	</button>
</div>

<style>
	.toast {
		position: relative;
		width: 24rem;
		border-radius: 6px;
		background: #fff;
		box-shadow: 0 6px 20px -5px rgba(0, 0, 0, 0.1);
		display: flex;
		overflow-x: hidden;
		align-items: center;
		transform: translateX(calc(100% + 30px));
		transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.35);
		padding: 1rem;
	}

	.description {
		font-size: 12px;
	}

	.toast.active {
		transform: translateX(0%);
	}

	.toast .close {
		position: absolute;
		top: 10px;
		right: 15px;
		cursor: pointer;
		opacity: 0.7;
	}
</style>
