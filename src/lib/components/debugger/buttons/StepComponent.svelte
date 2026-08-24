<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import '../style.css';

	interface Props {
		myClass?: string;
		icon: string;
		alt: string;
		onClick?: () => void;
	}

	let { myClass = '', icon, alt, onClick }: Props = $props();
</script>

<button class="btn general-btn {myClass}" onclick={onClick} title="Step">
	<ImageRender {icon} {alt} />
</button>
