<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Toast } from 'flowbite-svelte';
	import { type Toast as NotificationToast } from '$lib/store/toasts.store.ts';
	import { FireOutline } from 'flowbite-svelte-icons';

	interface Props {
		toast: NotificationToast;
	}

	let { toast }: Props = $props();
</script>

<div class="notification">
	<Toast transition={slide} color="green" position="top-right">
		<FireOutline
			slot="icon"
			class="h-6 w-6 bg-primary-100 text-primary-500 dark:bg-primary-800 dark:text-primary-200"
		/>
		{toast?.message}
	</Toast>
</div>

<style>
	.notification {
		z-index: var(--notification-z-index);
	}
</style>
